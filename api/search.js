export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { keyword, marketplace = 'es', maxResults = 10 } = req.body;

  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
  const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return res.status(500).json({ error: 'DataForSEO credentials not configured' });
  }

  // Map marketplace to DataForSEO location + language
  const marketplaceConfig = {
    es: { location_code: 2724, language_code: 'es', domain: 'amazon.es' },
    de: { location_code: 2276, language_code: 'de', domain: 'amazon.de' },
    uk: { location_code: 2826, language_code: 'en', domain: 'amazon.co.uk' },
    it: { location_code: 2380, language_code: 'it', domain: 'amazon.it' },
    fr: { location_code: 2250, language_code: 'fr', domain: 'amazon.fr' },
  };

  const config = marketplaceConfig[marketplace] || marketplaceConfig.es;
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  try {
    const response = await fetch('https://api.dataforseo.com/v3/serp/amazon/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword,
        location_code: config.location_code,
        language_code: config.language_code,
        depth: maxResults,
        se_domain: config.domain,
      }]),
    });

    const data = await response.json();

    // --- AQUÍ ESTÁ LA CORRECCIÓN CLAVE ---
    if (!response.ok || data.status_code !== 20000) {
      console.error("Error devuelto por DataForSEO:", JSON.stringify(data, null, 2));
      
      // Captura el mensaje de error ya sea que venga dentro de 'tasks' o en la raíz de la respuesta
      const errMsg = data?.tasks?.[0]?.status_message || data?.status_message || 'Error desconocido en la API';
      const errCode = data?.status_code || response.status;
      
      return res.status(500).json({ error: `Fallo DataForSEO: ${errMsg} (Código: ${errCode})` });
    }
    // -------------------------------------

    const items = data?.tasks?.[0]?.result?.[0]?.items || [];

    const products = items
      .filter(item => item.type === 'amazon_serp_element' && item.asin)
      .slice(0, maxResults)
      .map((item, i) => ({
        position: i + 1,
        asin: item.asin,
        title: item.title || 'Sin título',
        brand: item.brand || 'Desconocido',
        price: item.price_from ? `${item.price_from}€` : 'N/A',
        rating: item.rating?.value || null,
        reviews_count: item.rating?.votes_count || 0,
        bought_last_month: item.bought_last_month || null,
        is_amazon_choice: item.is_amazon_choice || false,
        is_best_seller: item.is_best_seller || false,
        image_url: item.image_url || null,
        url: `https://www.${config.domain}/dp/${item.asin}`,
        reviews_url: `https://www.${config.domain}/product-reviews/${item.asin}/?sortBy=recent&reviewerType=all_reviews`,
      }));

    return res.status(200).json({
      success: true,
      keyword,
      marketplace: config.domain,
      total: products.length,
      products,
    });

  } catch (err) {
    console.error("Error en el bloque catch:", err);
    return res.status(500).json({ error: `Error interno: ${err.message}` });
  }
}

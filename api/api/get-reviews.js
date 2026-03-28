export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { asin, marketplace = 'es', limit = 100 } = req.body;

  if (!asin) return res.status(400).json({ error: 'ASIN is required' });

  const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
  const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return res.status(500).json({ error: 'DataForSEO credentials not configured in Vercel' });
  }

  // Map marketplace to DataForSEO locale for Merchant API
  const marketplaceConfig = {
    es: { location_code: 2724, locale: 'en_ES' }, // Reviews are usually in local language, let's use the standard locale
    de: { location_code: 2276, locale: 'de_DE' },
    uk: { location_code: 2826, locale: 'en_GB' },
    it: { location_code: 2380, locale: 'it_IT' },
    fr: { location_code: 2250, locale: 'fr_FR' },
  };

  const config = marketplaceConfig[marketplace] || marketplaceConfig.es;
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  try {
    // Usamos el endpoint específico de Reseñas de DataForSEO
    const response = await fetch('https://api.dataforseo.com/v3/merchant/amazon/reviews/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        asin,
        location_code: config.location_code,
        depth: limit, // Número máximo de reviews a descargar (DataForSEO cobra por bloque de 100)
        sort_by: 'recent' // Nos interesan las más actuales
      }]),
    });

    const data = await response.json();

    if (!response.ok || data.status_code !== 20000) {
      console.error("Error devuelto por DataForSEO (Reviews):", JSON.stringify(data, null, 2));
      const errMsg = data?.tasks?.[0]?.status_message || data?.status_message || 'Error desconocido';
      const errCode = data?.status_code || response.status;
      return res.status(500).json({ error: `Fallo DataForSEO Reviews: ${errMsg} (Código: ${errCode})` });
    }

    // Procesamos y limpiamos las reseñas
    const items = data?.tasks?.[0]?.result?.[0]?.items || [];
    
    // Limpiamos la reseña: extraemos estrellas, limpiamos el HTML del texto, etc.
    const cleanReviews = items
      .filter(item => item.type === 'amazon_review') // Nos aseguramos de que es una reseña y no un anuncio
      .map(item => ({
        timestamp: item.timestamp,
        review_text: item.review_text?.replace(/<[^>]*>?/gm, '').trim() || '', // Limpiamos HTML
        stars: item.rating?.value || 0,
        verified: item.is_verified || false,
        variant: item.variant?.trim() || null // Útil para productos con tallas/colores
      }));

    return res.status(200).json({
      success: true,
      asin,
      total_found: cleanReviews.length,
      reviews: cleanReviews,
    });

  } catch (err) {
    console.error("Error en get-reviews catch:", err);
    return res.status(500).json({ error: `Error interno de servidor: ${err.message}` });
  }
}

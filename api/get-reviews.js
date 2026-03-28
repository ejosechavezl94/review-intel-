export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let { asin, marketplace = 'es', limit = 100 } = req.body;

  // --- LÓGICA DE LIMPIEZA "ANTI-ERRORES" ---
  if (!asin) return res.status(400).json({ error: 'ASIN is required' });

  // 1. Buscamos el patrón de un ASIN (10 caracteres alfanuméricos que suelen empezar por B)
  // Esto permite que si pegas "asin: B0CGHXYM1Y" o "  b0cghxym1y  ", el código extraiga solo el ID.
  const asinMatch = asin.match(/[A-Z0-9]{10}/i);
  if (!asinMatch) {
    return res.status(400).json({ error: `El formato del ASIN "${asin}" no es válido.` });
  }
  
  // 2. Lo pasamos siempre a Mayúsculas y quitamos espacios (Imprescindible para la API)
  const cleanAsin = asinMatch[0].toUpperCase();

  const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
  const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return res.status(500).json({ error: 'Credenciales de DataForSEO no configuradas en Vercel.' });
  }

  // Configuración de Marketplace
  const marketplaceConfig = {
    es: { location_code: 2724, domain: 'amazon.es' },
    de: { location_code: 2276, domain: 'amazon.de' },
    uk: { location_code: 2826, domain: 'amazon.co.uk' },
    it: { location_code: 2380, domain: 'amazon.it' },
    fr: { location_code: 2250, domain: 'amazon.fr' },
    us: { location_code: 2840, domain: 'amazon.com' }
  };

  const config = marketplaceConfig[marketplace] || marketplaceConfig.es;
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  try {
    const response = await fetch('https://api.dataforseo.com/v3/merchant/amazon/reviews/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        asin: cleanAsin,
        location_code: config.location_code,
        depth: limit,
        sort_by: 'recent'
      }]),
    });

    const data = await response.json();

    // --- MANEJO DE ERRORES DETALLADO ---
    if (!response.ok || data.status_code !== 20000) {
      const statusMsg = data?.status_message || "Error de conexión";
      const taskMsg = data?.tasks?.[0]?.status_message || "";
      
      // Si la API dice que no encontró el ASIN, lo reportamos amigablemente
      if (statusMsg.includes("not found") || taskMsg.includes("not found")) {
        return res.status(404).json({ error: `El ASIN ${cleanAsin} no existe en Amazon ${config.domain}.` });
      }

      return res.status(500).json({ 
        error: `DataForSEO: ${statusMsg} | ${taskMsg}`,
        status_code: data?.status_code 
      });
    }

    const items = data?.tasks?.[0]?.result?.[0]?.items || [];
    
    // Si no hay reseñas, devolvemos un error específico para que el frontend lo sepa
    if (items.length === 0) {
      return res.status(404).json({ error: `No se encontraron reseñas para el ASIN ${cleanAsin}.` });
    }

    const cleanReviews = items
      .filter(item => item.type === 'amazon_review')
      .map(item => ({
        timestamp: item.timestamp,
        review_text: item.review_text?.replace(/<[^>]*>?/gm, '').trim() || '',
        stars: item.rating?.value || 0,
        verified: item.is_verified || false
      }));

    return res.status(200).json({
      success: true,
      asin: cleanAsin,
      total_found: cleanReviews.length,
      reviews: cleanReviews,
    });

  } catch (err) {
    return res.status(500).json({ error: `Fallo crítico: ${err.message}` });
  }
}

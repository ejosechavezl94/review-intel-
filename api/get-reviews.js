export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { asin, marketplace = 'es' } = req.body;
    
    // Limpieza de ASIN profunda
    const cleanAsin = asin?.match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase();
    if (!cleanAsin) return res.status(400).json({ error: "ASIN no detectado correctamente." });

    // Diagnóstico de llaves
    const login = process.env.DATAFORSEO_LOGIN;
    const pass = process.env.DATAFORSEO_PASSWORD;

    if (!login || !pass) {
      return res.status(500).json({ 
        error: "ERROR DE LLAVES: No encuentro DATAFORSEO_LOGIN o DATAFORSEO_PASSWORD en Vercel. Revisa 'Environment Variables'." 
      });
    }

    const auth = Buffer.from(`${login.trim()}:${pass.trim()}`).toString('base64');

    // Llamada simplificada pero robusta
    const response = await fetch('https://api.dataforseo.com/v3/merchant/amazon/reviews/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        asin: cleanAsin,
        location_code: 2724, // Forzamos España para probar
        depth: 20
      }]),
    });

    const data = await response.json();

    if (!response.ok || data.status_code !== 20000) {
      return res.status(500).json({ 
        error: `DataForSEO respondió error: ${data.status_message || 'Desconocido'}`,
        debug: data.tasks?.[0]?.status_message 
      });
    }

    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      return res.status(404).json({ error: `Amazon no devolvió reseñas para ${cleanAsin}. Revisa si el producto tiene comentarios escritos.` });
    }

    const reviews = items
      .filter(i => i.type === 'amazon_review')
      .map(i => ({
        stars: i.rating?.value || 0,
        review_text: i.review_text?.replace(/<[^>]*>?/gm, '') || ''
      }));

    return res.status(200).json({ success: true, reviews });

  } catch (err) {
    return res.status(500).json({ error: `Error interno del servidor: ${err.message}` });
  }
}

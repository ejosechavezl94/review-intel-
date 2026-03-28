export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { asin, marketplace = 'es' } = req.body;

    // 1. Validación y Limpieza de ASIN
    if (!asin) return res.status(400).json({ error: 'Falta el ASIN' });
    const cleanAsin = asin.trim().toUpperCase().match(/[A-Z0-9]{10}/)?.[0];
    
    if (!cleanAsin) {
      return res.status(400).json({ error: `Formato de ASIN inválido: ${asin}` });
    }

    // 2. Verificación de Credenciales (Diagnóstico)
    const login = process.env.DATAFORSEO_LOGIN;
    const pass = process.env.DATAFORSEO_PASSWORD;

    if (!login || !pass) {
      return res.status(500).json({ 
        error: 'Error de Configuración: Credenciales DATAFORSEO no encontradas en Vercel Settings.' 
      });
    }

    const auth = Buffer.from(`${login}:${pass}`).toString('base64');

    // 3. Configuración de Marketplace
    const mks = {
      es: 2724, de: 2276, uk: 2826, it: 2380, fr: 2250, us: 2840
    };
    const locationCode = mks[marketplace] || 2724;

    // 4. Llamada a DataForSEO
    const response = await fetch('https://api.dataforseo.com/v3/merchant/amazon/reviews/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        asin: cleanAsin,
        location_code: locationCode,
        depth: 50,
        sort_by: 'recent'
      }]),
    });

    const data = await response.json();

    // 5. Manejo de errores de la API
    if (!response.ok || data.status_code !== 20000) {
      const msg = data.tasks?.[0]?.status_message || data.status_message || 'Error desconocido de API';
      return res.status(response.status || 500).json({ 
        error: `DataForSEO Error: ${msg}`,
        code: data.status_code 
      });
    }

    // 6. Procesar resultados
    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      return res.status(404).json({ error: `No se encontraron reseñas para el ASIN ${cleanAsin} en este marketplace.` });
    }

    const reviews = items
      .filter(i => i.type === 'amazon_review')
      .map(i => ({
        stars: i.rating?.value || 0,
        review_text: i.review_text?.replace(/<[^>]*>?/gm, '') || ''
      }));

    return res.status(200).json({ success: true, reviews });

  } catch (err) {
    console.error("ERROR CRÍTICO:", err);
    return res.status(500).json({ error: `Error interno: ${err.message}` });
  }
}

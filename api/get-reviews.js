export default async function handler(req, res) {
  // Configuración de cabeceras para evitar bloqueos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { asin } = req.body;
    
    // Extraer el ASIN de forma limpia
    const cleanAsin = asin?.match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase();
    if (!cleanAsin) return res.status(400).json({ error: "ASIN no válido" });

    // --- LEER CLAVES DIRECTAMENTE ---
    const login = process.env.DATAFORSEO_LOGIN;
    const pass = process.env.DATAFORSEO_PASSWORD;

    // Si no hay claves, devolvemos un error CLARO
    if (!login || !pass) {
      return res.status(500).json({ 
        error: "ERROR_CONFIG: Revisa las Environment Variables en Vercel. Asegúrate de que los nombres DATAFORSEO_LOGIN y DATAFORSEO_PASSWORD están bien escritos." 
      });
    }

    // Autenticación básica manual (más compatible)
    const auth = Buffer.from(`${login.trim()}:${pass.trim()}`).toString('base64');

    // Llamada a DataForSEO
    const response = await fetch('https://api.dataforseo.com/v3/merchant/amazon/reviews/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        asin: cleanAsin,
        location_code: 2724, // España
        depth: 20
      }]),
    });

    const data = await response.json();

    // Verificamos si la API de DataForSEO nos da error (ej: saldo agotado o clave mal)
    if (data.status_code !== 20000) {
      return res.status(500).json({ 
        error: `DataForSEO dice: ${data.status_message}`,
        task_error: data.tasks?.[0]?.status_message
      });
    }

    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      return res.status(404).json({ error: `No hay reseñas para ${cleanAsin} en España.` });
    }

    // Limpiamos los datos para enviarlos a la IA
    const reviews = items
      .filter(i => i.type === 'amazon_review')
      .map(i => ({
        stars: i.rating?.value || 0,
        review_text: i.review_text?.replace(/<[^>]*>?/gm, '') || ''
      }));

    return res.status(200).json({ success: true, reviews });

  } catch (err) {
    // Si el servidor de Vercel explota, aquí veremos por qué
    return res.status(500).json({ error: `Error Crítico Servidor: ${err.message}` });
  }
}

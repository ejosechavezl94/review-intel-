const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { asin } = req.body;
    const cleanAsin = asin?.match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase();
    if (!cleanAsin) return res.status(400).json({ error: "ASIN inválido" });

    const login = process.env.DATAFORSEO_LOGIN;
    const pass = process.env.DATAFORSEO_PASSWORD;
    if (!login || !pass) return res.status(500).json({ error: "Faltan variables DATAFORSEO" });

    const auth = Buffer.from(`${login.trim()}:${pass.trim()}`).toString('base64');
    const postData = JSON.stringify([{ asin: cleanAsin, location_code: 2724, depth: 30 }]);

    const options = {
      hostname: 'api.dataforseo.com',
      path: '/v3/merchant/amazon/reviews/live',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const reqApi = https.request(options, (response) => {
        let str = '';
        response.on('data', (chunk) => str += chunk);
        response.on('end', () => resolve(JSON.parse(str)));
      });
      reqApi.on('error', (e) => reject(e));
      reqApi.write(postData);
      reqApi.end();
    });

    if (result.status_code !== 20000) return res.status(500).json({ error: result.status_message });

    const items = result.tasks?.[0]?.result?.[0]?.items || [];
    const reviews = items.filter(i => i.type === 'amazon_review').map(i => ({
      stars: i.rating?.value || 0,
      review_text: i.review_text?.replace(/<[^>]*>?/gm, '') || ''
    }));

    if (reviews.length === 0) return res.status(404).json({ error: "No hay reseñas escritas" });
    return res.status(200).json({ success: true, reviews });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

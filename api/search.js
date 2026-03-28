const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { keyword, marketplace = 'es', maxResults = 10 } = req.body;
    if (!keyword) return res.status(400).json({ error: 'Keyword requerida' });

    const login = process.env.DATAFORSEO_LOGIN;
    const pass = process.env.DATAFORSEO_PASSWORD;
    if (!login || !pass) return res.status(500).json({ error: 'Faltan variables DATAFORSEO' });

    const mks = {
      es: { loc: 2724, lang: 'es', dom: 'amazon.es' },
      de: { loc: 2276, lang: 'de', dom: 'amazon.de' },
      uk: { loc: 2826, lang: 'en', dom: 'amazon.co.uk' },
      it: { loc: 2380, lang: 'it', dom: 'amazon.it' },
      fr: { loc: 2250, lang: 'fr', dom: 'amazon.fr' },
      us: { loc: 2840, lang: 'en', dom: 'amazon.com' }
    };

    const conf = mks[marketplace] || mks.es;
    const auth = Buffer.from(`${login.trim()}:${pass.trim()}`).toString('base64');
    const postData = JSON.stringify([{
      keyword,
      location_code: conf.loc,
      language_code: conf.lang,
      depth: maxResults,
      se_domain: conf.dom
    }]);

    const options = {
      hostname: 'api.dataforseo.com',
      path: '/v3/serp/amazon/organic/live/advanced',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const reqApi = https.request(options, (resApi) => {
        let str = '';
        resApi.on('data', (chunk) => str += chunk);
        resApi.on('end', () => {
          try { resolve(JSON.parse(str)); }
          catch (e) { reject(new Error('Invalid JSON from DataForSEO')); }
        });
      });
      reqApi.on('error', (e) => reject(e));
      reqApi.write(postData);
      reqApi.end();
    });

    const items = result?.tasks?.[0]?.result?.[0]?.items || [];
    const products = items
      .filter(i => i.type === 'amazon_serp_element' && i.asin)
      .map((item, i) => ({
        position: i + 1,
        asin: item.asin,
        title: item.title || 'Sin título',
        brand: item.brand || 'Desconocido',
        price: item.price_from ? `${item.price_from}€` : 'N/A',
        rating: item.rating?.value || null,
        reviews_count: item.rating?.votes_count || 0
      }));

    return res.status(200).json({ success: true, products });

  } catch (err) {
    console.error('Error en search.js:', err);
    return res.status(500).json({ error: err.message });
  }
};

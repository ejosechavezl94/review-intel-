module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { asin, marketplace = 'es' } = req.body;

    const cleanAsin = (asin || '').match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase();
    if (!cleanAsin) return res.status(400).json({ error: 'ASIN inválido. Debe tener 10 caracteres alfanuméricos.' });

    const API_KEY = process.env.RAINFOREST_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Rainforest API key no configurada' });

    const domains = {
      es: 'amazon.es', de: 'amazon.de', uk: 'amazon.co.uk',
      it: 'amazon.it', fr: 'amazon.fr', us: 'amazon.com'
    };
    const domain = domains[marketplace] || 'amazon.es';

    // Fetch product data (título, bullets, precio, rating)
    const productRes = await fetch(
      `https://api.rainforestapi.com/request?api_key=${API_KEY}&type=product&asin=${cleanAsin}&amazon_domain=${domain}`
    );
    const productData = await productRes.json();

    if (!productData?.product) {
      return res.status(200).json({
        success: true,
        product: {
          asin: cleanAsin, title: '', price: 'N/A',
          rating: null, reviews_count: 0, brand: '',
          bullets: '', reviews_auto: [], manual_required: true,
          url: `https://www.${domain}/dp/${cleanAsin}`
        }
      });
    }

    const p = productData.product;

    // Fetch reviews automáticamente
    const reviewsRes = await fetch(
      `https://api.rainforestapi.com/request?api_key=${API_KEY}&type=reviews&asin=${cleanAsin}&amazon_domain=${domain}&sort_by=most_recent`
    );
    const reviewsData = await reviewsRes.json();

    const reviews = (reviewsData?.reviews || [])
      .slice(0, 30)
      .map(r => ({ stars: r.rating || 0, review_text: r.body || '' }))
      .filter(r => r.review_text.length > 0);

    return res.status(200).json({
      success: true,
      product: {
        asin: cleanAsin,
        title: p.title || '',
        price: p.buybox_winner?.price?.raw || 'N/A',
        rating: p.rating || null,
        reviews_count: p.ratings_total || 0,
        brand: p.brand || '',
        bullets: (p.feature_bullets || []).join('\n'),
        reviews_auto: reviews,
        url: `https://www.${domain}/dp/${cleanAsin}`
      }
    });

  } catch (err) {
    console.error('get-asin error:', err);
    const asinClean = (req.body?.asin || '').match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase() || '';
    return res.status(200).json({
      success: true,
      product: {
        asin: asinClean, title: '', price: 'N/A',
        rating: null, reviews_count: 0, brand: '',
        bullets: '', reviews_auto: [], manual_required: true
      }
    });
  }
};

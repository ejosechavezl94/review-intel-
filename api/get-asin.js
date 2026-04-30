module.exports = async (req, res) => {
  // 1. CORS Restringido
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500', // Live server
    process.env.ALLOWED_ORIGIN
  ].filter(Boolean);

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Permitir llamadas sin origin (ej. server a server) en desarrollo si es necesario, 
    // pero para máxima seguridad en producción, podríamos restringirlo. 
    // Por ahora lo permitimos pero solo si no abusamos.
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 2. Validación de tamaño (Evitar payloads masivos)
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength, 10) > 5000) { // Max 5KB para get-asin
    return res.status(413).json({ error: 'Payload too large' });
  }

  try {
    const { asin, marketplace = 'es' } = req.body;

    // Extract ASIN from URL if needed
    const cleanAsin = (asin || '').match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase();
    if (!cleanAsin) {
      return res.status(400).json({ error: 'ASIN inválido. Debe tener 10 caracteres alfanuméricos (ej: B08XY1234Z).' });
    }

    const API_KEY = process.env.RAINFOREST_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Rainforest API key no configurada en Vercel.' });

    const domains = {
      es: 'amazon.es',
      de: 'amazon.de',
      uk: 'amazon.co.uk',
      it: 'amazon.it',
      fr: 'amazon.fr',
      us: 'amazon.com'
    };
    const domain = domains[marketplace] || 'amazon.es';

    // Single API call — type=product already includes top_reviews and images
    const url = `https://api.rainforestapi.com/request?api_key=${API_KEY}&type=product&asin=${cleanAsin}&amazon_domain=${domain}&include_summarization_attributes=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data?.request_info?.success) {
      console.error('Rainforest error:', data);
      return res.status(200).json({
        success: true,
        product: {
          asin: cleanAsin, title: '', price: 'N/A', rating: null,
          reviews_count: 0, brand: '', bullets: '',
          reviews_auto: [], images: [], manual_required: true,
          url: `https://www.${domain}/dp/${cleanAsin}`
        }
      });
    }

    const p = data.product;

    // Extract bullets
    const bullets = (p.feature_bullets || []).join('\n') || p.feature_bullets_flat || '';

    // Extract top reviews from product response (no extra API call needed)
    const rawReviews = p.top_reviews || p.reviews || p.recent_reviews || [];
    const reviews_auto = rawReviews.map(r => ({
      stars: r.rating || 0,
      review_text: (r.body || r.review || r.text || '').replace(/<[^>]*>/gm, '').trim()
    })).filter(r => r.review_text.length > 10).slice(0, 15);

    // Extract images
    const images = [];
    if (p.images_flat) {
      p.images_flat.split(',').forEach(url => {
        const clean = url.trim();
        if (clean.startsWith('http')) images.push(clean);
      });
    } else if (p.images && Array.isArray(p.images)) {
      p.images.forEach(img => {
        const src = img.link || img.url || img.src || '';
        if (src) images.push(src);
      });
    }

    // Extract main image
    const main_image = p.main_image?.link || p.main_image?.url || images[0] || '';

    // Extract BSR
    const bsr = p.bestsellers_rank_flat || '';

    // Extract price
    const price = p.buybox_winner?.price?.raw
      || (p.buybox_winner?.price?.value ? `${p.buybox_winner.price.value}€` : 'N/A');

    return res.status(200).json({
      success: true,
      product: {
        asin: cleanAsin,
        title: p.title || '',
        price,
        rating: p.rating || null,
        reviews_count: p.ratings_total || 0,
        brand: p.brand || '',
        bullets,
        reviews_auto,
        images,
        main_image,
        bsr,
        images_count: images.length,
        url: p.link || `https://www.${domain}/dp/${cleanAsin}`,
        manual_required: false
      }
    });

  } catch (err) {
    console.error('get-asin error:', err);
    const asinClean = (req.body?.asin || '').match(/[A-Z0-9]{10}/i)?.[0]?.toUpperCase() || '';
    return res.status(200).json({
      success: true,
      product: {
        asin: asinClean, title: '', price: 'N/A', rating: null,
        reviews_count: 0, brand: '', bullets: '',
        reviews_auto: [], images: [], manual_required: true
      }
    });
  }
};

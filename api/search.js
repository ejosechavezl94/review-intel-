export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reviews, product_context, competitor_name } = req.body;

  if (!reviews || reviews.trim().length < 30) {
    return res.status(400).json({ error: 'Reviews text too short' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const prompt = `Eres un experto en Amazon FBA y análisis de competencia para Private Label.
Analiza estas reseñas del competidor "${competitor_name || 'Desconocido'}"${product_context ? ` (producto: ${product_context})` : ''}.

RESEÑAS:
${reviews}

Devuelve SOLO un JSON válido con esta estructura exacta, sin markdown ni texto extra:

{
  "summary": "Resumen ejecutivo de 4-5 líneas: estado general del competidor, principales debilidades y oportunidades para superarlo.",
  "stats": {
    "total_analyzed": número estimado de reviews analizadas,
    "sentiment_negative_pct": porcentaje negativo (0-100),
    "sentiment_positive_pct": porcentaje positivo (0-100),
    "main_weakness": "La debilidad principal en 5-8 palabras"
  },
  "problems": [
    {
      "stars": "1 o 2",
      "text": "Paráfrasis representativa de queja real",
      "themes": ["tema principal", "tema secundario"],
      "severity": "alta | media"
    }
  ],
  "positives": [
    {
      "stars": "4 o 5",
      "text": "Paráfrasis representativa de elogio real",
      "themes": ["tema"],
      "emulate": true
    }
  ],
  "patterns": [
    {
      "title": "Nombre del patrón detectado",
      "description": "Qué pasa exactamente y por qué importa para tu producto",
      "type": "bad | good | neutral",
      "count": número de menciones estimadas,
      "pct": porcentaje del total (0-100),
      "opportunity": "Cómo puedes aprovecharlo en tu producto"
    }
  ],
  "scores": [
    {
      "topic": "Tema (ej: Calidad material, Durabilidad, Packaging)",
      "frequency": "Alta | Media | Baja",
      "severity": "Alta | Media | Baja",
      "competitor_score": número 1-10 (10 = muy mal para el competidor),
      "your_opportunity": número 1-10 (10 = gran oportunidad para ti)
    }
  ],
  "actions": [
    {
      "category": "CATEGORÍA EN MAYÚSCULAS (ej: PRODUCTO, PACKAGING, COMUNICACIÓN)",
      "priority": "alta | media",
      "action": "Acción específica y concreta que debes tomar antes de lanzar",
      "impact": "Por qué esto te dará ventaja competitiva real"
    }
  ]
}

Reglas:
- problems: 3-6 quejas más representativas
- positives: 2-4 elogios más representativas
- patterns: 4-7 patrones ordenados por frecuencia
- scores: 4-6 temas clave
- actions: 3-5 acciones concretas y accionables
- Sé específico. Nada genérico. Todo orientado a Private Label pre-lanzamiento.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Eres un experto en Amazon FBA. Respondes SOLO con JSON válido, sin markdown ni texto extra.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');

    const rawText = data.choices?.[0]?.message?.content || '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ success: true, analysis: parsed });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

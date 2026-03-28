module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { competitors, my_product } = req.body;
  if (!competitors || competitors.length === 0) {
    return res.status(400).json({ error: 'No hay datos de competidores' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key no configurada' });

  const competitorText = competitors.map((c, i) => `
=== COMPETIDOR ${i + 1} — ASIN: ${c.asin} ===
Título: ${c.title || 'No disponible'}
Precio: ${c.price || 'No disponible'}
Rating: ${c.rating || 'No disponible'} estrellas | ${c.reviews_count || 0} reseñas

BULLET POINTS:
${c.bullets || 'No proporcionados'}

RESEÑAS:
${c.reviews || 'No proporcionadas'}
`).join('\n');

  const prompt = `Eres un experto en Amazon FBA con 10 años de experiencia en Private Label, listings y cumplimiento de políticas de Amazon Europa.

${my_product ? `Producto que va a lanzar el seller: ${my_product}\n` : ''}

Analiza estos competidores y genera un informe completo:

${competitorText}

REGLAS DE AMAZON QUE DEBES VERIFICAR EN CADA LISTING:
- Prohibido incluir claims de salud o médicos sin certificación
- Prohibido mencionar "Amazon's Choice", "#1", "Best Seller" en bullets/título
- Prohibido usar emojis en el título
- Prohibido hacer comparaciones directas con marcas ("mejor que X")
- Prohibido usar términos como "gratuito", "garantía de devolución de dinero" en bullets
- Prohibido: porcentajes de descuento o precios de referencia falsos
- Bullets deben empezar con mayúscula, max 200 caracteres cada uno
- Título: máximo 200 caracteres, no todo en mayúsculas
- Prohibido claims no verificables como "el mejor del mundo"

Devuelve SOLO JSON válido, sin markdown:

{
  "executive_summary": "Resumen de 4-6 líneas sobre el estado del mercado y la gran oportunidad detectada.",
  "competitors": [
    {
      "asin": "ASIN",
      "title_score": número 1-10,
      "bullet_score": número 1-10,
      "overall_score": número 1-10,
      "title_analysis": "Qué hace bien y mal el título. Keywords usadas. Longitud.",
      "bullet_analysis": "Análisis de cada bullet: estructura, beneficios comunicados, lo que falta.",
      "compliance_issues": ["Lista de violaciones de políticas Amazon detectadas o vacía si ninguna"],
      "main_weakness": "La debilidad más explotable de este competidor",
      "main_strength": "Su punto más fuerte a emular o superar"
    }
  ],
  "market_gaps": [
    {
      "gap": "Gap detectado en el mercado",
      "evidence": "En qué competidores/reseñas se ve esto",
      "opportunity": "Cómo aprovecharlo en tu producto y listing"
    }
  ],
  "my_listing_recommendations": {
    "title": {
      "recommended": "Título recomendado para tu producto (máx 200 chars, sin emojis, con keywords clave detectadas)",
      "keywords_to_use": ["keyword1", "keyword2", "keyword3"],
      "reasoning": "Por qué este título supera a los competidores"
    },
    "bullets": [
      {
        "bullet": "Texto completo del bullet point recomendado (empieza en mayúscula, máx 200 chars)",
        "reasoning": "Por qué este bullet ataca un gap del mercado"
      }
    ],
    "compliance_warnings": ["Cosas que NO debes incluir en tu listing según políticas Amazon"]
  },
  "actions": [
    {
      "priority": "Alta | Media",
      "action": "Acción concreta y específica",
      "impact": "Impacto esperado en conversión o posicionamiento"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'Eres un experto en Amazon FBA. Respondes SOLO con JSON válido. Sin markdown, sin texto extra.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');

    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ success: true, analysis: parsed });
  } catch (err) {
    console.error('analyze-listing error:', err);
    return res.status(500).json({ error: err.message });
  }
};

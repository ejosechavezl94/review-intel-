module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reviewsData, product_context } = req.body;

  if (!reviewsData || reviewsData.trim().length < 50) {
    return res.status(400).json({ error: 'Reviews text too short or missing' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const prompt = `Eres un experto en Amazon FBA y análisis de competencia para Private Label.
Tu objetivo es analizar un conjunto de reseñas pertenecientes a VARIOS competidores (identificados por su ASIN) y extraer conclusiones claras y accionables.
${product_context ? `\nContexto del producto a lanzar: ${product_context}\n` : ''}
A continuación se presentan las reseñas extraídas, agrupadas por ASIN:

${reviewsData}

CLASIFICACIÓN ESTRICTA DE TEMAS:
Al analizar, debes clasificar cada problema, queja o ventaja detectada en una de estas categorías EXACTAS:
1. Tamaño / fit / medidas
2. Materiales / calidad
3. Durabilidad / se rompe pronto
4. Uso / funcionamiento (no hace lo que promete)
5. Packaging / envase
6. Instrucciones / manual / experiencia de uso
7. Envío / tiempo de entrega
8. Servicio postventa / soporte
9. Precio / valor percibido
10. Otros

Devuelve SOLO un JSON válido con esta estructura exacta, sin markdown ni texto extra:

{
  "summary": "Resumen ejecutivo de 5-10 líneas: estado general de los competidores, problemas comunes en el mercado y la gran oportunidad para un nuevo producto.",
  "competitor_scores": [
    {
      "asin": "ASIN del competidor",
      "main_weakness": "Debilidad principal",
      "best_feature": "Lo que mejor hacen",
      "weakness_score": 7
    }
  ],
  "comparison_table": [
    {
      "topic": "Nombre exacto de la categoría",
      "worst_asin": "ASIN con más quejas",
      "best_asin": "ASIN mejor valorado",
      "insight": "Breve explicación del patrón detectado"
    }
  ],
  "patterns_and_gaps": [
    {
      "theme": "Categoría exacta",
      "pattern": "Patrón repetido",
      "star_range": "1-2 estrellas",
      "opportunity": "Cómo solucionar este gap en el nuevo producto"
    }
  ],
  "actions": [
    {
      "priority": "Alta",
      "action": "Acción hiper-específica para el producto o comunicación",
      "impact": "Por qué esto dará ventaja competitiva real"
    }
  ]
}

Reglas:
- Sé implacable en el análisis de las debilidades.
- Compara siempre: busca qué falla en casi todos los ASINs.
- Diferencia quejas graves (1-2 estrellas) de fricciones (3-4 estrellas).
- La salida debe ser estrictamente JSON parseable. Nada de texto antes ni después.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 3000,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'Eres un analista de datos FBA. Devuelves SOLO un JSON válido. Cero formato markdown, cero explicaciones.' },
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
    console.error('Error en analyze.js:', err);
    return res.status(500).json({ error: err.message });
  }
};

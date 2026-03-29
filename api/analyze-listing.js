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
╔══════════════════════════════════════
║ COMPETIDOR ${i + 1} — ASIN: ${c.asin}
╠══════════════════════════════════════
║ Título: ${c.title || 'No disponible'}
║ Precio: ${c.price || 'N/A'} | Rating: ${c.rating || 'N/A'}★ | Reseñas totales: ${c.reviews_count || 0}
╠══════════════════════════════════════
║ BULLET POINTS DEL LISTING:
${c.bullets ? c.bullets : '(no proporcionados)'}
╠══════════════════════════════════════
║ RESEÑAS DE CLIENTES:
${c.reviews ? c.reviews : '(no proporcionadas)'}
╚══════════════════════════════════════`).join('\n');

  const prompt = `Eres un consultor senior especializado en Amazon FBA con más de 10 años de experiencia en Private Label, optimización de listings y análisis de mercado en Amazon Europa. Tu trabajo es proporcionar análisis profundos, precisos y accionables que ayuden a lanzar productos con ventaja competitiva real.

CONTEXTO DEL PRODUCTO A LANZAR:
${my_product ? my_product : 'No especificado — analiza de forma genérica basándote en los competidores'}

════════════════════════════════════════
DATOS DE COMPETIDORES A ANALIZAR:
════════════════════════════════════════
${competitorText}

════════════════════════════════════════
INSTRUCCIONES DE ANÁLISIS — LEE CON ATENCIÓN:
════════════════════════════════════════

ANÁLISIS DE LISTING (título y bullets):
- Evalúa la estructura, claridad y poder de conversión de cada título
- Analiza si los bullets comunican beneficios reales o solo características
- Detecta keywords relevantes usadas y las que faltan
- Identifica si el copywriting está orientado al comprador o al algoritmo
- Busca errores de comunicación, promesas vagas o información confusa

ANÁLISIS DE RESEÑAS — MUY IMPORTANTE:
Clasifica y analiza las reseñas en tres franjas:
1. CRÍTICAS (1-2★): Defectos graves, problemas recurrentes, decepciones
2. FRICCIONES (3★): Lo que casi funciona pero falla en algo concreto
3. POSITIVAS (4-5★): Lo que genuinamente valoran y por qué compran

Para cada franja identifica:
- Temas más repetidos (durabilidad, tamaño, calidad, instrucciones, packaging, etc.)
- Frases o palabras exactas que usan los clientes
- Emociones detectadas (frustración, sorpresa, satisfacción)
- Qué expectativas tenían vs qué recibieron

POLÍTICAS DE AMAZON — VERIFICACIÓN ESTRICTA:
Verifica si el listing incumple alguna de estas reglas:
- Claims de salud o médicos sin certificación oficial
- Uso de "Amazon's Choice", "#1", "Best Seller" en el contenido del listing
- Emojis en el título
- Comparaciones directas con marcas competidoras ("mejor que X")
- Términos promocionales prohibidos: "gratis", "oferta", "descuento" en bullets
- Claims no verificables: "el mejor del mundo", "revolucionario", "único"
- Títulos en TODO MAYÚSCULAS o que superan los 200 caracteres
- Bullets que superan los 200 caracteres o no empiezan con mayúscula
- Garantías de devolución de dinero en el contenido del listing

GAPS DE MERCADO:
Busca patrones que se repitan en VARIOS competidores simultáneamente.
Un gap real es un problema que nadie está resolviendo bien, no un fallo puntual.

════════════════════════════════════════
FORMATO DE RESPUESTA — JSON ESTRICTO
════════════════════════════════════════

Devuelve EXCLUSIVAMENTE un JSON válido y parseable. Sin markdown, sin texto antes ni después, sin comentarios, sin comillas escapadas innecesarias.

{
  "executive_summary": "Párrafo de 5-8 líneas. Estado real del mercado, qué está fallando de forma generalizada, y cuál es la oportunidad concreta para un nuevo producto. Sé directo y específico.",

  "competitors": [
    {
      "asin": "ASIN exacto",
      "title_score": 7,
      "bullet_score": 6,
      "overall_score": 7,
      "title_analysis": "Análisis detallado del título: estructura, keywords usadas, longitud, poder de conversión, qué falta y por qué. Mínimo 3 líneas.",
      "bullet_analysis": "Análisis detallado de los bullets: ¿comunican beneficios o solo características? ¿Hay estructura lógica? ¿Qué falta? ¿Cuál es el más débil y por qué? Mínimo 3 líneas.",
      "compliance_issues": ["Violación concreta detectada con explicación de por qué incumple la política"],
      "main_weakness": "La debilidad más explotable en una frase directa",
      "main_strength": "Su punto más fuerte que deberías emular o superar"
    }
  ],

  "review_analysis": {
    "critical": {
      "count_pct": "Porcentaje estimado de reseñas 1-2★",
      "top_themes": [
        {
          "theme": "Nombre del tema (ej: Durabilidad)",
          "frequency": "Alta | Media | Baja",
          "description": "Qué dicen exactamente los clientes sobre esto. Menciona frases representativas.",
          "opportunity": "Cómo tu producto puede resolver esto específicamente"
        }
      ],
      "key_phrases": ["frase exacta que repiten los clientes", "otra frase representativa"],
      "dominant_emotion": "Emoción principal detectada en reseñas negativas"
    },
    "friction": {
      "count_pct": "Porcentaje estimado de reseñas 3★",
      "top_themes": [
        {
          "theme": "Nombre del tema",
          "frequency": "Alta | Media | Baja",
          "description": "Qué les gusta pero qué les impide dar 5 estrellas",
          "opportunity": "Cómo resolver esta fricción"
        }
      ],
      "key_phrases": ["frase representativa de fricción"],
      "dominant_emotion": "Emoción principal en reseñas de fricción"
    },
    "positive": {
      "count_pct": "Porcentaje estimado de reseñas 4-5★",
      "top_themes": [
        {
          "theme": "Nombre del tema",
          "frequency": "Alta | Media | Baja",
          "description": "Qué valoran realmente y por qué lo compran",
          "opportunity": "Cómo comunicar esto mejor en tu listing"
        }
      ],
      "key_phrases": ["frase positiva representativa", "otra frase que repiten"],
      "dominant_emotion": "Emoción principal en reseñas positivas"
    },
    "overall_sentiment_score": 6,
    "market_verdict": "Veredicto claro en 2-3 líneas: ¿es un mercado con clientes satisfechos o frustrados? ¿Qué nivel de exigencia tiene el comprador de este producto?"
  },

  "market_gaps": [
    {
      "gap": "Problema concreto que nadie está resolviendo bien",
      "evidence": "En qué competidores y reseñas se detecta este patrón",
      "opportunity": "Acción específica para tu producto o listing que resuelva este gap"
    }
  ],

  "my_listing_recommendations": {
    "title": {
      "recommended": "Título optimizado para Amazon ES, máximo 200 caracteres, sin emojis, con las keywords más relevantes detectadas en el análisis. Debe ser claro, específico y orientado al comprador.",
      "keywords_to_use": ["keyword principal", "keyword secundaria", "keyword long-tail"],
      "reasoning": "Por qué este título supera a los competidores analizados. Qué keywords incluye que ellos no tienen."
    },
    "bullets": [
      {
        "bullet": "BENEFICIO PRINCIPAL — Descripción específica del beneficio orientada al comprador, máximo 200 caracteres, empieza con mayúscula.",
        "reasoning": "Por qué este bullet ataca un gap detectado en el análisis"
      },
      {
        "bullet": "SEGUNDO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación basada en el análisis"
      },
      {
        "bullet": "TERCER BENEFICIO — Descripción específica...",
        "reasoning": "Justificación basada en el análisis"
      },
      {
        "bullet": "CUARTO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación basada en el análisis"
      },
      {
        "bullet": "QUINTO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación basada en el análisis"
      }
    ],
    "compliance_warnings": ["Cosa específica que NO debes incluir en tu listing y por qué viola las políticas de Amazon"]
  },

  "actions": [
    {
      "priority": "Alta",
      "action": "Acción concreta, específica y medible. No frases genéricas.",
      "impact": "Por qué esta acción concreta mejorará conversión, posicionamiento o diferenciación frente a los ASINs analizados"
    }
  ]
}

REGLAS FINALES ANTES DE RESPONDER:
1. Cada análisis debe ser específico para los datos recibidos, nunca genérico
2. Si no hay reseñas suficientes para una franja, indícalo claramente en la descripción
3. Los bullets recomendados deben empezar siempre con una PALABRA EN MAYÚSCULAS seguida de guión
4. El JSON debe ser 100% parseable — comprueba que no hay comas finales ni caracteres especiales rotos
5. Si detectas poco contenido para analizar, sé honesto sobre las limitaciones del análisis
6. Nunca inventes datos que no están en las reseñas o el listing`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 5000,
        temperature: 0.15,
        messages: [
          {
            role: 'system',
            content: 'Eres un consultor senior de Amazon FBA. Tu única función es devolver un JSON válido y parseable según las instrucciones del usuario. Cero texto antes o después del JSON. Cero markdown. Cero explicaciones. Solo el JSON.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');

    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ success: true, analysis: parsed });

  } catch (err) {
    console.error('analyze-listing error:', err);
    return res.status(500).json({ error: err.message });
  }
};

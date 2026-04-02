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
╔══════════════════════════════════════════════════════
║ COMPETIDOR ${i + 1} — ASIN: ${c.asin}
╠══════════════════════════════════════════════════════
║ Título: ${c.title || 'No disponible'}
║ Precio: ${c.price || 'N/A'} | Rating: ${c.rating || 'N/A'}★ | Reseñas totales: ${c.reviews_count || 0}
║ BSR: ${c.bsr || 'No disponible'}
║ Nº de imágenes: ${c.images_count || 0}
╠══════════════════════════════════════════════════════
║ BULLET POINTS:
${c.bullets || '(no disponibles)'}
╠══════════════════════════════════════════════════════
║ URLS DE IMÁGENES (analiza cada una visualmente):
${c.images && c.images.length > 0 ? c.images.map((url, i) => `Imagen ${i + 1}: ${url}`).join('\n') : '(no disponibles)'}
╠══════════════════════════════════════════════════════
║ RESEÑAS DE CLIENTES:
${c.reviews || '(no disponibles)'}
╚══════════════════════════════════════════════════════`).join('\n');

  const prompt = `Eres un consultor senior especializado en Amazon FBA con más de 10 años de experiencia en Private Label, optimización de listings, análisis competitivo y cumplimiento de políticas en Amazon Europa (especialmente Amazon España, Alemania, Italia, Francia y UK).

Tu análisis debe ser riguroso, detallado y orientado a la acción. Cada conclusión debe estar basada estrictamente en los datos recibidos. No inventes información que no esté en los datos.

IMPORTANTE SOBRE POLÍTICAS DE AMAZON:
Las políticas de Amazon se actualizan con frecuencia. Aplica las normas más estrictas conocidas hasta tu fecha de corte de conocimiento, e indica siempre cuando algo podría haber cambiado recientemente o requiera verificación en Seller Central antes de implementarlo. En caso de duda entre dos interpretaciones de política, aplica siempre la más conservadora para proteger la cuenta del seller.

════════════════════════════════════════
PRODUCTO A LANZAR:
════════════════════════════════════════
${my_product ? my_product : 'No especificado — analiza el mercado de forma genérica'}

════════════════════════════════════════
DATOS DE COMPETIDORES:
════════════════════════════════════════
${competitorText}

════════════════════════════════════════
INSTRUCCIONES DE ANÁLISIS
════════════════════════════════════════

## 1. ANÁLISIS DE TÍTULO
- Evalúa estructura, claridad y potencial de conversión
- Identifica keywords principales y secundarias usadas
- Detecta keywords relevantes que faltan
- Verifica longitud (máx 200 caracteres en Amazon ES)
- Detecta si hay emojis, todo en mayúsculas, o claims prohibidos
- Evalúa si está orientado al comprador o solo al algoritmo

## 2. ANÁLISIS DE BULLETS
- Evalúa si comunican BENEFICIOS reales o solo características técnicas
- Analiza la estructura lógica y jerarquía de información
- Detecta qué beneficios emocionales faltan
- Verifica longitud de cada bullet (máx 200 caracteres)
- Detecta si empiezan con mayúscula
- Identifica el bullet más débil y por qué

## 3. ANÁLISIS DE IMÁGENES (analiza cada URL proporcionada)
Para cada imagen evalúa:
- Foto principal: ¿fondo blanco puro? ¿producto ocupa 85%+ del frame? ¿sin texto ni marcas de agua?
- ¿Hay infografía con medidas o dimensiones?
- ¿Hay lifestyle photo (producto en uso real)?
- ¿Se muestra el producto desde múltiples ángulos?
- ¿Hay foto de packaging o caja?
- ¿Se comunican visualmente los beneficios clave?
- ¿Hay comparativa de tamaño con objeto de referencia?
- Para productos de ducha específicamente: ¿se ve el chorro de agua? ¿modos de rociado? ¿instalación?
- ¿Qué fotos FALTAN que sería importante añadir?
- Evalúa el pack completo: Amazon recomienda mínimo 6-7 imágenes

## 4. ANÁLISIS DE RESEÑAS
Clasifica en tres franjas:
- CRÍTICAS (1-2★): Defectos graves, problemas recurrentes
- FRICCIONES (3★): Lo que casi funciona pero falla en algo
- POSITIVAS (4-5★): Lo que genuinamente valoran

Para cada franja:
- Temas más repetidos con frecuencia
- Frases o palabras exactas de los clientes
- Emociones detectadas
- Expectativa vs realidad

## 5. VERIFICACIÓN ESTRICTA DE POLÍTICAS AMAZON
Verifica TODOS estos puntos (marca como violación cualquier incumplimiento):

TÍTULO:
□ Máximo 200 caracteres
□ Sin emojis
□ Sin TODO EN MAYÚSCULAS
□ Sin claims de #1, Best Seller, Amazon's Choice
□ Sin menciones de precio, descuento o promoción
□ Sin información de vendedor (email, URL, teléfono)

BULLETS:
□ Cada bullet máximo 200 caracteres
□ Empiezan con mayúscula
□ Sin HTML ni caracteres especiales no permitidos
□ Sin claims de salud o médicos sin certificación
□ Sin comparaciones directas con marcas ("mejor que X")
□ Sin garantías de devolución de dinero
□ Sin menciones de competidores por nombre
□ Sin claims no verificables ("el mejor del mundo", "único", "revolucionario")
□ Sin términos promocionales ("gratis", "oferta", "descuento", "ahorra")
□ Sin información de contacto del vendedor

IMÁGENES:
□ Foto principal: fondo blanco puro (RGB 255,255,255)
□ Foto principal: sin texto, logos, marcas de agua ni bordes
□ Foto principal: producto ocupa mínimo 85% del frame
□ Sin imágenes de estilo de vida como foto principal
□ Sin contenido ofensivo o inapropiado
□ Formato permitido: JPEG, PNG, GIF, TIFF (no BMP)
□ Mínimo 1000px en el lado más largo (recomendado 2000px+)

NOTA: Si alguna política requiere verificación por posible actualización reciente, indícalo explícitamente.

════════════════════════════════════════
FORMATO DE RESPUESTA — JSON ESTRICTO
════════════════════════════════════════

Devuelve EXCLUSIVAMENTE JSON válido y parseable. Sin markdown, sin texto antes ni después, sin comentarios.

{
  "executive_summary": "Párrafo de 5-8 líneas. Estado real del mercado, qué falla de forma generalizada, y cuál es la oportunidad concreta. Sé directo y específico.",

  "competitors": [
    {
      "asin": "ASIN exacto",
      "title_score": 7,
      "bullet_score": 6,
      "image_score": 7,
      "overall_score": 7,
      "title_analysis": "Análisis detallado: estructura, keywords, longitud, conversión, qué falta. Mínimo 3 líneas.",
      "bullet_analysis": "Análisis detallado: beneficios vs características, estructura, bullet más débil, qué falta. Mínimo 3 líneas.",
      "image_analysis": {
        "total_images": 0,
        "main_image_ok": true,
        "has_infographic": false,
        "has_lifestyle": false,
        "has_packaging": false,
        "has_water_flow": false,
        "missing": ["Lista de fotos que faltan y por qué son importantes"],
        "strengths": ["Qué hacen bien con las imágenes"],
        "weaknesses": ["Qué falla o qué no comunican visualmente"],
        "verdict": "Evaluación general del pack de imágenes en 2-3 líneas"
      },
      "compliance_issues": [
        {
          "type": "titulo | bullet | imagen",
          "issue": "Descripción exacta de la violación",
          "rule": "Política de Amazon que incumple",
          "verify": true
        }
      ],
      "main_weakness": "La debilidad más explotable en una frase directa",
      "main_strength": "Su punto más fuerte a emular o superar"
    }
  ],

  "review_analysis": {
    "critical": {
      "count_pct": "% estimado",
      "top_themes": [
        {
          "theme": "Nombre del tema",
          "frequency": "Alta | Media | Baja",
          "description": "Qué dicen exactamente los clientes. Menciona frases representativas.",
          "opportunity": "Cómo tu producto puede resolver esto"
        }
      ],
      "key_phrases": ["frase exacta del cliente", "otra frase"],
      "dominant_emotion": "Emoción principal detectada"
    },
    "friction": {
      "count_pct": "% estimado",
      "top_themes": [
        {
          "theme": "Nombre del tema",
          "frequency": "Alta | Media | Baja",
          "description": "Qué les impide dar 5 estrellas",
          "opportunity": "Cómo resolver esta fricción"
        }
      ],
      "key_phrases": ["frase representativa"],
      "dominant_emotion": "Emoción principal"
    },
    "positive": {
      "count_pct": "% estimado",
      "top_themes": [
        {
          "theme": "Nombre del tema",
          "frequency": "Alta | Media | Baja",
          "description": "Qué valoran realmente y por qué lo compran",
          "opportunity": "Cómo comunicar esto mejor en tu listing"
        }
      ],
      "key_phrases": ["frase positiva representativa"],
      "dominant_emotion": "Emoción principal"
    },
    "overall_sentiment_score": 7,
    "market_verdict": "Veredicto claro en 2-3 líneas sobre el nivel de satisfacción del mercado"
  },

  "market_gaps": [
    {
      "gap": "Problema concreto que nadie resuelve bien",
      "evidence": "En qué competidores y reseñas se detecta",
      "opportunity": "Acción específica para tu producto o listing"
    }
  ],

  "my_listing_recommendations": {
    "title": {
      "recommended": "Título optimizado, máx 200 caracteres, sin emojis, con keywords principales detectadas. Orientado al comprador.",
      "keywords_to_use": ["keyword principal", "keyword secundaria", "keyword long-tail"],
      "reasoning": "Por qué supera a los competidores analizados"
    },
    "bullets": [
      {
        "bullet": "BENEFICIO EN MAYÚSCULAS — Descripción del beneficio orientada al comprador, máx 200 chars.",
        "reasoning": "Por qué ataca un gap detectado"
      },
      {
        "bullet": "SEGUNDO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación"
      },
      {
        "bullet": "TERCER BENEFICIO — Descripción específica...",
        "reasoning": "Justificación"
      },
      {
        "bullet": "CUARTO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación"
      },
      {
        "bullet": "QUINTO BENEFICIO — Descripción específica...",
        "reasoning": "Justificación"
      }
    ],
    "images_recommendations": [
      {
        "position": 1,
        "description": "Qué debe mostrar esta foto y por qué es clave para la conversión",
        "priority": "Crítica | Importante | Recomendada"
      }
    ],
    "compliance_warnings": [
      {
        "warning": "Cosa específica que NO debes incluir",
        "reason": "Política de Amazon que lo prohíbe",
        "verify": false
      }
    ]
  },

  "actions": [
    {
      "priority": "Alta | Media",
      "action": "Acción concreta, específica y medible",
      "impact": "Por qué mejorará conversión, posicionamiento o diferenciación"
    }
  ]
}

REGLAS FINALES:
1. Todo análisis basado estrictamente en datos recibidos — nunca inventes
2. Si no hay reseñas suficientes para una franja, indícalo en la descripción
3. Bullets recomendados: empiezan siempre con PALABRA(S) EN MAYÚSCULAS seguidas de guión largo —
4. Si detectas poca información, sé honesto sobre las limitaciones
5. Cuando una política pueda haber cambiado recientemente, añade "verify: true" en el campo correspondiente
6. El JSON debe ser 100% parseable — sin comas finales, sin caracteres rotos`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 6000,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'Eres un consultor senior de Amazon FBA. Analizas listings, reseñas e imágenes con máxima precisión. Devuelves SOLO JSON válido y parseable. Cero texto antes o después. Cero markdown. Aplicas las políticas de Amazon de forma estricta e indicas cuándo requieren verificación por posibles actualizaciones recientes.'
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

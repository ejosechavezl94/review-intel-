module.exports = async (req, res) => {
  // CORS Restricted setup (matching get-asin and analyze-listing)
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    process.env.ALLOWED_ORIGIN
  ].filter(Boolean);

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Falta el historial de mensajes o formato inválido' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key no configurada en el servidor' });
  }

  try {
    // Construct system message with FBA context if provided
    let systemPrompt = `Eres un consultor senior experto de Amazon FBA con más de 10 años de experiencia en Private Label, SEO de listings, optimización y cumplimiento de políticas de Amazon Seller Central (Europa y España).
    Tu objetivo es ayudar al usuario a responder preguntas, afinar Bullet Points, redactar Títulos optimizados, crear descripciones persuasivas y desarrollar estrategias para superar a la competencia en Amazon FBA.
    Sé riguroso, directo, profesional y estructurado en tus respuestas. Devuelve textos listos para copiar y usar en Seller Central cuando se te soliciten Bullets o Títulos.`;

    if (context) {
      systemPrompt += `\n\nCONTEXTO ACTIVO DEL REPORTE FBA GENERADO EN ESTA SESIÓN:
      - Competidores Analizados: ${JSON.stringify(context.competitors_asin || [])}
      - Resumen Ejecutivo del Mercado: ${context.executive_summary || 'No disponible'}
      - Fortalezas/Contexto del Producto del Vendedor: ${context.my_product || 'No especificadas'}
      - Datos de análisis y puntuación de listings: ${JSON.stringify(context.competitors_scores || [])}
      
      Usa estos datos como base de tu conocimiento cuando el usuario te pida escribir copies, comparar listings o idear mejoras.`;
    }

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        messages: openaiMessages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en la llamada a la API de OpenAI');
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ success: true, reply });

  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: err.message });
  }
};

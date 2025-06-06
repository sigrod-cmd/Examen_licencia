export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Falta el prompt o es inválido' });
  }

  try {
    const urlGemini = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clave API no configurada' });
    }

    const fullUrl = `${urlGemini}?key=${apiKey}`;

    const bodyPayload = {
      prompt: {
        messages: [
          {
            author: "user",
            content: {
              text: prompt
            }
          }
        ]
      },
      temperature: 0.7,
      candidateCount: 1
    };

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const textError = await response.text();
      console.error('Error API Gemini:', textError);
      return res.status(response.status).json({ error: textError });
    }

    const data = await response.json();

    // Ejemplo: extraer el texto generado del resultado
    const generatedText = data.candidates?.[0]?.content?.text || null;

    if (!generatedText) {
      return res.status(500).json({ error: 'No se recibió contenido generado' });
    }

    return res.status(200).json({ content: generatedText });

  } catch (error) {
    console.error('Error en /api/generate-image:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

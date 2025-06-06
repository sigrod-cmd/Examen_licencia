export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Falta el prompt o es inválido' });
  }

  try {
    // URL base sin la clave
    const urlGemini = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clave API no configurada' });
    }

    const fullUrl = `${urlGemini}?key=${apiKey}`;

    const resultado = await llamarApiGemini(fullUrl, { prompt });

    if (!resultado) {
      return res.status(500).json({ error: 'No se obtuvo resultado válido de Gemini' });
    }

    return res.status(200).json({ image: resultado });

  } catch (error) {
    console.error('Error en /api/generate-image:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function llamarApiGemini(url, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de Gemini:', errorText);
      throw new Error(`Error en llamada a Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error llamando a Gemini:', error);
    throw error;
  }
}

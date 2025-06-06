export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Falta el prompt o es inválido' });
  }

  try {
    const urlGemini = 'https://api.gemini.example.com/generate-image';

    // Obtenemos la clave API desde la variable de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('La clave API no está configurada en las variables de entorno');
    }

    const resultado = await llamarApiGemini(urlGemini, { prompt }, apiKey);

    if (!resultado) {
      return res.status(500).json({ error: 'No se obtuvo resultado válido de Gemini' });
    }

    return res.status(200).json({ image: resultado.image });

  } catch (error) {
    console.error('Error en /api/generate-image:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function llamarApiGemini(url, payload, apiKey) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,  // Usamos la clave API aquí
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en la llamada a Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.image) {
      throw new Error('Respuesta inválida o incompleta desde Gemini');
    }

    return data;
  } catch (error) {
    console.error('Error llamando a Gemini:', error);
    throw error;
  }
}

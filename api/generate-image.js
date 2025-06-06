// Usamos 'node-fetch' para hacer llamadas a la API desde el servidor
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Obtenemos el "prompt" que nos envía el front-end
    const { prompt } = req.body;

    // La clave API la leemos de una variable de entorno segura, NUNCA la escribimos aquí
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
        return res.status(400).json({ error: "No se proporcionó un prompt." });
    }
    if (!apiKey) {
        return res.status(500).json({ error: "La clave API no está configurada en el servidor." });
    }

    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const requestBody = {
        "contents": [{ "parts": [{ "text": `Generate the clean SVG code for: ${prompt}. The SVG should be responsive, start with <svg> and end with </svg>. Do not include any other text or markdown characters like \`\`\`.` }] }],
    };

    try {
        const geminiResponse = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(errorData.error.message || `Error en la API de Gemini: ${geminiResponse.status}`);
        }

        const data = await geminiResponse.json();
        let svgCode = data.candidates[0].content.parts[0].text;

        // Limpiamos la respuesta por si acaso
        svgCode = svgCode.replace(/```svg/g, "").replace(/```/g, "").trim();

        // Enviamos el código SVG de vuelta al front-end
        res.status(200).json({ svgCode });

    } catch (error) {
        console.error("Error en la función serverless:", error);
        res.status(500).json({ error: error.message });
    }
};
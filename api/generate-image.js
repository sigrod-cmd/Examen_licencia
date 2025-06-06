// Archivo: /api/generate-image.js

// Importamos la dependencia necesaria para hacer llamadas HTTP desde el servidor.
// 'node-fetch' en su versión 2 es ideal para entornos serverless como Vercel.
const fetch = require('node-fetch');

// Exportamos la función como un módulo para que Vercel la pueda ejecutar.
module.exports = async (req, res) => {
    // Medida de seguridad: solo aceptamos peticiones de tipo POST.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extraemos el "prompt" del cuerpo de la solicitud que nos envía el front-end.
    const { prompt } = req.body;

    // La clave API se lee de una variable de entorno segura (la configuraremos en Vercel).
    // NUNCA se escribe directamente en el código.
    const apiKey = process.env.GEMINI_API_KEY;

    // Validaciones de entrada.
    if (!prompt) {
        return res.status(400).json({ error: "Bad Request: No se proporcionó un prompt." });
    }
    if (!apiKey) {
        // Este error solo ocurriría si olvidamos configurar la variable en el servidor.
        return res.status(500).json({ error: "Server Configuration Error: La clave API no está configurada." });
    }

    // Usamos el endpoint del modelo 'gemini-1.5-flash-latest', que es rápido y eficiente para esta tarea.
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    // Construimos el cuerpo de la solicitud para la API de Gemini.
    // Damos instrucciones muy precisas a la IA para que solo devuelva código SVG limpio.
    const requestBody = {
        "contents": [{ 
            "parts": [{ 
                "text": `Generate only the clean, complete, and valid SVG code for the following traffic sign: ${prompt}. The SVG must be responsive, start with <svg> and end with </svg>. Do not include any other text, explanations, or markdown characters like \`\`\`.` 
            }] 
        }],
    };

    try {
        // Realizamos la llamada a la API de Gemini.
        const geminiResponse = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const responseData = await geminiResponse.json();

        // Manejo de errores si la respuesta de Gemini no es exitosa.
        if (!geminiResponse.ok) {
            console.error("API Error Response:", responseData);
            throw new Error(responseData.error.message || `API Error: ${geminiResponse.status}`);
        }

        // Validación del formato de la respuesta.
        if (!responseData.candidates || !responseData.candidates[0].content || !responseData.candidates[0].content.parts[0].text) {
             console.error("Unexpected API Response Format:", responseData);
             throw new Error("Formato de respuesta de la API inesperado.");
        }

        let svgCode = responseData.candidates[0].content.parts[0].text;

        // Limpieza final para asegurar que solo enviamos el código SVG.
        svgCode = svgCode.replace(/```svg/g, "").replace(/```/g, "").trim();

        // Si todo va bien, enviamos la respuesta exitosa (código 200) con el SVG al cliente.
        res.status(200).json({ svgCode });

    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
};
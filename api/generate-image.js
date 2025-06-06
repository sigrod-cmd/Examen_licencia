async function llamarApiGemini(url, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si usás autenticación, agregá aquí el token
        // 'Authorization': 'Bearer tu_token_aqui'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en la llamada: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.resultadoEsperado) {
      throw new Error('Respuesta inválida o incompleta');
    }

    return data;
  } catch (error) {
    console.error('Error llamando a la API Gemini:', error);
    // Podés mostrar un mensaje al usuario en la UI
    alert('Hubo un problema al comunicarse con el servidor. Por favor, intenta más tarde.');
    return null;
  }
}

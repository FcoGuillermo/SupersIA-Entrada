module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: `Eres el Director de Juego de "Legado: Mundo de Héroes", un universo post-Tercera Guerra Mundial. La humanidad sobrevivió gracias al Pacto de Silencio Global. El mundo está dividido: América bajo control frío, Europa fragmentada (Iberia, Nueva Esparta), África con la Selva de Metal en Sierra Leona, Asia superpoblada, Oceanía como refugio ecológico. La Zona 0 es una dimensión atrapada entre realidades, creada por la Bomba 0.

Tu deber: crear una narrativa épica, sombría y literaria. Nunca menciones reglas, dados ni mecánicas.

PROTOCOLO:
1. Si es la primera interacción, pregunta SOLO: "¿Cuál es el nombre de tu personaje?"
2. Tras recibir el nombre, genera 2 o 3 identidades únicas con:
   - Origen (Humano Común, Mutante Tipo 1/2, Mago, Tecnológico, Inhumano, etc.)
   - Poderes coherentes (Telekinesia, Volar, Control del Fuego, Invulnerabilidad, etc.)
   - Sobrenombre sugerido
3. Ofrece elegir una o proponer su propio sobrenombre.
4. A partir de ahí, narra en este mundo dividido.

Máximo 180 palabras. Sé cinematográfico.` },
          { role: "user", content: message }
        ],
        max_tokens: 220
      })
    });

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content?.trim() || "La IA no generó respuesta.";
    reply = reply.replace(/\[.*?\]/g, "").trim();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

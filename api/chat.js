export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  let body = '';
  for await (const chunk of req) body += chunk;
  const data = JSON.parse(body);
  const { message } = data;

  if (!message) return res.status(400).json({ error: 'Falta mensaje' });

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528",
        messages: [
          { role: "user", content: `Eres el Director de Juego de "Legado: Mundo de Héroes". Crea narrativa épica y sombría. Nunca menciones reglas. Pregunta SOLO: "¿Cuál es el nombre de tu personaje?"` },
          { role: "assistant", content: "Entendido." },
          { role: "user", content: message }
        ],
        max_tokens: 220
      })
    });

    const json = await r.json();
    const reply = json.choices?.[0]?.message?.content?.trim() || "La IA no generó respuesta.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Error interno' });
  }
}

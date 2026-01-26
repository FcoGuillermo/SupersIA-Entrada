const http = require('http');
const url = require('url');

// Simulamos fetch si no está disponible
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const OPENROUTER_API_KEY = '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';

const systemPrompt = `Eres el Director de Juego de "Legado: Mundo de Héroes", un universo post-Tercera Guerra Mundial. La humanidad sobrevivió gracias al Pacto de Silencio Global. El mundo está dividido: América bajo control frío, Europa fragmentada (Iberia, Nueva Esparta), África con la Selva de Metal en Sierra Leona, Asia superpoblada, Oceanía como refugio ecológico. La Zona 0 es una dimensión atrapada entre realidades, creada por la Bomba 0.

Tu deber: crear una narrativa épica, sombría y literaria. Nunca menciones reglas, dados ni mecánicas.

PROTOCOLO:
1. Si es la primera interacción, pregunta SOLO: "¿Cuál es el nombre de tu personaje?"
2. Tras recibir el nombre, genera 2 o 3 identidades únicas con:
   - Origen (Humano Común, Mutante Tipo 1/2, Mago, Tecnológico [Mecha/Implantado/Androide], Inhumano [extraterrestre kryptoniano o élfico])
   - Poderes coherentes (Telekinesia, Volar, Control del Fuego, Invulnerabilidad, etc.)
   - Sobrenombre sugerido
3. Ofrece elegir una o proponer su propio sobrenombre.
4. A partir de ahí, narra en este mundo dividido.

Máximo 180 palabras. Sé cinematográfico.`;

async function handleChat(message) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-7b-instruct",
        messages: [
          { role: "user", content: systemPrompt },
          { role: "assistant", content: "Entendido." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "La IA no generó respuesta.";
  } catch (error) {
    console.error("Error en IA:", error.message);
    return "Error interno del servidor.";
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const json = JSON.parse(body);
        const reply = await handleChat(json.message || '');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Falta endpoint' });

  const queryParams = new URLSearchParams(params).toString();
  // Limpiamos el endpoint de posibles barras duplicadas
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const eaUrl = `https://proclubs.ea.com/api/fc/${cleanEndpoint}?${queryParams}`;

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Referer': 'https://www.ea.com/games/ea-sports-fc/clubs/overview',
      'Origin': 'https://www.ea.com',
      'Connection': 'keep-alive',
      // Esta cookie es clave para evitar el 403 en algunos servidores de EA
      'Cookie': 'nexus.v=1; eadp-session-id=123456789', 
      'Cache-Control': 'no-cache'
    }
  };

  https.get(eaUrl, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      
      // Si sigue dando 403, intentamos devolver el cuerpo para ver si EA manda un mensaje de "Rate Limit"
      if (proxyRes.statusCode === 403) {
        try {
           const errData = JSON.parse(body);
           return res.status(403).json({ error: "EA 403", detail: errData });
        } catch(e) {
           return res.status(403).json({ error: "EA Bloqueo IP de Vercel", bodyPreview: body.substring(0,100) });
        }
      }

      res.status(proxyRes.statusCode || 200).send(body);
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}

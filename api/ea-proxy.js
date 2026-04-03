const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Falta endpoint' });

  // Importante: No usamos URLSearchParams para el endpoint para evitar el %2F
  const queryParams = new URLSearchParams(params).toString();
  const eaUrl = `https://proclubs.ea.com/api/fc/${endpoint}?${queryParams}`;

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'es-ES,es;q=0.9',
      'Referer': 'https://www.ea.com/',
      'Origin': 'https://www.ea.com'
    }
  };

  https.get(eaUrl, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode || 200).setHeader('Content-Type', 'application/json');
      
      if (proxyRes.statusCode === 403) {
        return res.json({ 
          error: "EA bloqueó la conexión (403)", 
          solucion: "Es posible que EA haya cambiado sus reglas de seguridad hoy. Prueba cambiando la plataforma a 'common-gen4' solo para testear." 
        });
      }

      try {
        res.send(body);
      } catch (e) {
        res.status(502).send({ error: "Error parseando JSON de EA" });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}

const https = require('https');

export default function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Falta el parámetro endpoint' });
  }

  // Construir la Query String para EA
  const queryParams = new URLSearchParams(params).toString();
  const eaUrl = `https://proclubs.ea.com/api/fc/${endpoint}?${queryParams}`;

  const options = {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Referer': 'https://www.ea.com/',
      'Origin': 'https://www.ea.com'
    },
    timeout: 10000
  };

  https.get(eaUrl, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

      if (proxyRes.statusCode !== 200) {
        return res.status(proxyRes.statusCode).json({ error: 'EA API Error', status: proxyRes.statusCode });
      }

      try {
        const data = JSON.parse(body);
        res.status(200).json(data);
      } catch (e) {
        res.status(502).json({ error: 'Respuesta de EA no es JSON' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Error de conexión', message: err.message });
  });
}

const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // URL de ProClubs.io para tu club específico
  // Usamos su API interna que devuelve JSON
  const targetUrl = `https://proclubs.io/api/club/483418/common-gen5`;

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://proclubs.io/club/483418'
    }
  };

  https.get(targetUrl, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const data = JSON.parse(body);
        res.status(200).json(data);
      } catch (e) {
        res.status(502).json({ error: "No se pudo obtener datos de ProClubs", raw: body.substring(0, 100) });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}

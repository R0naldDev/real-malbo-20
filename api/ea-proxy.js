const https = require('https');

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    res.status(400).json({
      error: 'Falta el parametro "endpoint"',
      ejemplo: '/api/ea-proxy?endpoint=clubs/info&clubIds=483418&platform=common-gen5',
      endpoints: [
        'clubs/info',
        'clubs/seasonalStats',
        'clubs/overallStats',
        'clubs/matches',
        'members/stats',
        'members/career/stats'
      ]
    });
    return;
  }

  const qs = new URLSearchParams(params).toString();
  const eaPath = `/api/fc/${endpoint}${qs ? '?' + qs : ''}`;

  const options = {
    hostname: 'proclubs.ea.com',
    port: 443,
    path: eaPath,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Referer': 'https://www.ea.com/',
      'Origin': 'https://www.ea.com'
    },
    timeout: 10000
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
      res.setHeader('Content-Type', 'application/json');

      if (proxyRes.statusCode !== 200) {
        res.status(proxyRes.statusCode || 502).json({
          error: `EA API devolvio ${proxyRes.statusCode}`,
          detalle: body.substring(0, 300),
          url: `https://proclubs.ea.com${eaPath}`
        });
        return;
      }

      try {
        const data = JSON.parse(body);
        res.status(200).json(data);
      } catch (e) {
        res.status(502).json({
          error: 'Respuesta no es JSON valido',
          detalle: body.substring(0, 300),
          url: `https://proclubs.ea.com${eaPath}`
        });
      }
    });
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({
      error: 'No se pudo conectar con EA',
      mensaje: err.message,
      url: `https://proclubs.ea.com${eaPath}`
    });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.status(504).json({
      error: 'Timeout conectando con EA (10s)',
      url: `https://proclubs.ea.com${eaPath}`
    });
  });

  proxyReq.end();
};

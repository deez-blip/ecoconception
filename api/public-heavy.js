const Pyroscope = require('@pyroscope/nodejs');

if (!global.__pyroscopeInitialized) {
  const serverAddress = process.env.PYROSCOPE_SERVER_ADDRESS;
  const basicAuthUser = process.env.PYROSCOPE_BASIC_AUTH_USER;
  const basicAuthPassword = process.env.PYROSCOPE_BASIC_AUTH_PASSWORD;

  if (serverAddress && basicAuthUser && basicAuthPassword) {
    Pyroscope.init({
      appName: process.env.PYROSCOPE_APPLICATION_NAME || 'ecommerce-vercel-api',
      serverAddress,
      basicAuthUser,
      basicAuthPassword,
      flushIntervalMs: 5000,
      wall: { collectCpuTime: true },
      tags: { service: 'public-heavy-api' }
    });
    Pyroscope.start();
  }

  global.__pyroscopeInitialized = true;
}

const cache = new Map();

function heavyCompute(size = 30000, rounds = 80) {
  let arr = Array.from({ length: size }, (_, i) => (i * 17) % 997);

  for (let r = 0; r < rounds; r += 1) {
    arr = arr.map((x) => (x * 13 + 7) % 1009).sort((a, b) => a - b);
  }

  return arr[0];
}

function optimizedCompute(size = 30000, rounds = 80) {
  let acc = 0;

  for (let r = 0; r < rounds; r += 1) {
    for (let i = 0; i < size; i += 1) {
      acc = (acc + ((i * 13 + r) % 1009)) % 1000003;
    }
  }

  return acc;
}

module.exports = async (req, res) => {
  const mode = req.query.mode === 'before' ? 'before' : 'after';
  const size = Number(req.query.size || 30000);
  const rounds = Number(req.query.rounds || 80);
  const cacheKey = `${mode}:${size}:${rounds}`;

  if (mode === 'after' && cache.has(cacheKey)) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ mode, cached: true, result: cache.get(cacheKey) });
  }

  const start = Date.now();
  const result = mode === 'before' ? heavyCompute(size, rounds) : optimizedCompute(size, rounds);
  const durationMs = Date.now() - start;

  if (mode === 'after') {
    cache.set(cacheKey, result);
  }

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({ mode, cached: false, result, durationMs });
};

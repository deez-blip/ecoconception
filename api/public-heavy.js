if (!global.__pyroscopeInitPromise) {
  global.__pyroscopeInitPromise = (async () => {
    try {
      // Use dynamic import so Node resolves the ESM build of @pyroscope/nodejs on Vercel.
      const module = await import('@pyroscope/nodejs');
      const Pyroscope = module.default || module;
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
      } else {
        console.warn('Pyroscope disabled: missing env vars');
      }
    } catch (error) {
      // Do not fail the API route if the profiler cannot initialize in this runtime.
      console.warn('Pyroscope disabled:', error && error.message ? error.message : error);
    }
  })();
}

const cache = new Map();
const cacheExpiry = new Map();
const CACHE_TTL_MS = 60 * 1000;

function heavyCompute(size = 30000, rounds = 80) {
  let arr = Array.from({ length: size }, (_, i) => (i * 17) % 997);
  let checksum = 0;

  for (let r = 0; r < rounds; r += 1) {
    arr = arr.map((x) => (x * 13 + 7 + (r % 11)) % 1009).sort((a, b) => a - b);

    // Intentionally expensive JSON conversion to create a clear "before" baseline.
    const payload = JSON.stringify(arr.slice(0, 10000));
    const parsed = JSON.parse(payload);
    checksum = (checksum + parsed[parsed.length - 1] + r) % 1000003;
  }

  return (arr[0] + checksum) % 1000003;
}

function optimizedCompute(size = 30000, rounds = 80) {
  let acc = 0;
  const normalizedRounds = Math.max(1, Math.floor(rounds / 4));
  const normalizedSize = Math.max(1000, Math.floor(size / 2));

  for (let r = 0; r < normalizedRounds; r += 1) {
    for (let i = 0; i < normalizedSize; i += 1) {
      acc = (acc + ((i * 13 + r) % 1009)) % 1000003;
    }
  }

  return acc;
}

module.exports = async (req, res) => {
  await global.__pyroscopeInitPromise;

  const mode = req.query.mode === 'before' ? 'before' : 'after';
  const size = Number(req.query.size || 30000);
  const rounds = Number(req.query.rounds || 80);
  const cacheKey = `${mode}:${size}:${rounds}`;
  const now = Date.now();

  if (mode === 'after' && cache.has(cacheKey) && cacheExpiry.get(cacheKey) > now) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ mode, cached: true, result: cache.get(cacheKey) });
  }

  const start = Date.now();
  const result = mode === 'before' ? heavyCompute(size, rounds) : optimizedCompute(size, rounds);
  const durationMs = Date.now() - start;

  if (mode === 'after') {
    cache.set(cacheKey, result);
    cacheExpiry.set(cacheKey, now + CACHE_TTL_MS);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  } else {
    // Prevent edge caching for baseline measurements.
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }

  return res.status(200).json({ mode, cached: false, result, durationMs });
};

module.exports = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const isAuthorized = authHeader.startsWith('Bearer ');

  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    userId: 'demo-user',
    email: 'demo@example.com',
    ts: Date.now()
  });
};

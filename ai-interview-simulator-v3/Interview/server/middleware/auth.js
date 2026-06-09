const { findByToken } = require('../services/userStore');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.replace('Bearer ', '');
  const user = findByToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.replace('Bearer ', '');
    const user = findByToken(token);
    if (user) req.user = user;
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };

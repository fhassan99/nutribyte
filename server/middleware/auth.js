// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).send('Missing Authorization header');
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;            // <-- this is the ObjectId string
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).send('Invalid token');
  }
};

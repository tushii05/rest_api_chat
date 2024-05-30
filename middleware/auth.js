const jwt = require('jsonwebtoken');
const db = require('../database');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await db.User.findOne({ where: { id: decoded.id, jwtToken: token } });
    if (!user) return res.status(401).send('Invalid token.');
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

module.exports = authMiddleware;

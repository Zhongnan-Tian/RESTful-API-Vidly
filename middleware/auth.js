const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).send('No token found, access denied.');
  }

  try {
    const decoded = jwt.verify(token, keys.jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).send('Invalid Token.');
  }
}

module.exports = auth;

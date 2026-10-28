const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.usuario = jwt.verify(token, 'troque_este_segredo');
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }
};
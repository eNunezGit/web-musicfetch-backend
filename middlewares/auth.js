const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../utils/config');
const { AUTH, ERROR_MESSAGES } = require('../utils/constants');
const UnauthorizedError = require('../errors/UnauthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith(AUTH.BEARER_PREFIX)) {
    return next(new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED));
  }

  const token = authorization.replace(AUTH.BEARER_PREFIX, '');

  try {
    // El payload firmado en login es { _id }, así que req.user._id queda disponible
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN));
  }

  return next();
};

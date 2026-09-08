const rateLimit = require('express-rate-limit');

const { RATE_LIMIT, ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');

// Limita cuántas peticiones acepta la API desde una misma IP en una ventana
// de tiempo. Frena la fuerza bruta contra /signin y evita que un script
// tumbe el servidor a base de peticiones.
module.exports = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: { message: ERROR_MESSAGES.TOO_MANY_REQUESTS },
  standardHeaders: 'draft-7', // cabeceras RateLimit-* estándar
  legacyHeaders: false, // sin las antiguas X-RateLimit-*
});

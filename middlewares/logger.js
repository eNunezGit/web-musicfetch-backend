const winston = require('winston');
const expressWinston = require('express-winston');

// Nunca deben acabar en disco: el token da acceso completo a la cuenta
// y la contraseña viaja en claro en el cuerpo de /signup y /signin.
const headerBlacklist = ['authorization', 'cookie'];
const bodyBlacklist = ['password'];

// express-winston adjunta a cada error el estado del sistema (os, process,
// trace...): unos 4 KB por entrada que no dicen nada sobre la petición.
// Los quitamos y dejamos error, req y stack, que es lo que se depura.
const trimSystemMeta = winston.format((info) => {
  if (!info.meta) {
    return info;
  }

  const {
    os, process: processInfo, trace, exception, date, level, message, ...meta
  } = info.meta;

  return { ...info, meta };
})();

const jsonFormat = winston.format.combine(trimSystemMeta, winston.format.json());

// Registra TODAS las peticiones. Va antes de las rutas.
const requestLogger = expressWinston.logger({
  transports: [new winston.transports.File({ filename: 'request.log' })],
  format: jsonFormat,
  msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  headerBlacklist,
  bodyBlacklist,
});

// Registra solo las peticiones que terminan en error.
// Va después de las rutas y antes del manejador de errores.
const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: 'error.log' })],
  format: jsonFormat,
  msg: '{{req.method}} {{req.url}} — {{err.message}}',
  headerBlacklist,
  bodyBlacklist,
});

module.exports = { requestLogger, errorLogger };

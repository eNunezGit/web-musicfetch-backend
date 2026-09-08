const { isCelebrateError } = require('celebrate');

const { NODE_ENV } = require('../utils/config');
const { HTTP_STATUS, ERROR_MESSAGES, MONGO_DUPLICATE_KEY } = require('../utils/constants');

// Manejador de errores centralizado.
// Express lo reconoce por tener 4 argumentos: si quitas "next" deja de funcionar.
module.exports = (err, req, res, next) => {
  let { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message } = err;

  // Errores de Joi/celebrate -> 400.
  // Los traducimos aquí en vez de usar el errors() de celebrate para que
  // toda la API responda siempre con la misma forma: { message }.
  if (isCelebrateError(err)) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = [...err.details.values()]
      .flatMap((joiError) => joiError.details.map((detail) => detail.message))
      .join('. ');
  }

  // Errores de validación de Mongoose -> 400 (red de seguridad:
  // Joi ya filtra la entrada, pero el modelo sigue siendo la última palabra)
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map((error) => error.message).join('. ');
  }

  // _id con formato inválido -> 400
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.INVALID_ID;
  }

  // Índice único duplicado (correo repetido, pista ya guardada) -> 409
  if (err.code === MONGO_DUPLICATE_KEY) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = ERROR_MESSAGES.DUPLICATE_RESOURCE;
  }

  // Cualquier error no previsto: se registra completo, pero al cliente
  // solo le llega un mensaje genérico (nunca filtres el stack trace).
  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    if (NODE_ENV !== 'test') {
      console.error(err.stack);
    }
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  }

  res.status(statusCode).send({ message });
};

// Constantes de la aplicación: todo texto que ve el cliente y todo número
// que no es evidente por sí mismo vive aquí, no incrustado en la lógica.

// --- Códigos de estado HTTP ---
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// --- Mensajes de error ---
const ERROR_MESSAGES = {
  // 400
  BAD_REQUEST: 'Los datos enviados no son válidos',
  INVALID_ID: 'El identificador tiene un formato no válido',
  // 401
  UNAUTHORIZED: 'Se requiere autorización',
  INVALID_TOKEN: 'El token no es válido o ha expirado',
  WRONG_CREDENTIALS: 'Correo o contraseña incorrectos',
  // 403
  FORBIDDEN: 'No tienes permiso para realizar esta acción',
  NOT_TRACK_OWNER: 'No puedes eliminar una pista que no es tuya',
  // 404
  NOT_FOUND: 'El recurso solicitado no existe',
  USER_NOT_FOUND: 'No se encontró el usuario',
  TRACK_NOT_FOUND: 'No se encontró la pista',
  ROUTE_NOT_FOUND: 'La ruta solicitada no existe',
  // 409
  CONFLICT: 'El recurso ya existe',
  EMAIL_ALREADY_EXISTS: 'Ya existe una cuenta registrada con ese correo',
  DUPLICATE_RESOURCE: 'Ese recurso ya existe',
  // 429
  TOO_MANY_REQUESTS: 'Demasiadas peticiones desde esta IP. Inténtalo de nuevo más tarde.',
  // 500
  INTERNAL_SERVER_ERROR: 'Se ha producido un error en el servidor',
  // Arranque
  MISSING_JWT_SECRET: 'Falta la variable de entorno JWT_SECRET',
};

// --- Mensajes de respuesta correcta ---
const SUCCESS_MESSAGES = {
  TRACK_DELETED: 'Pista eliminada correctamente',
};

// --- Mensajes de validación (Joi y Mongoose) ---
const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'El correo es obligatorio',
  EMAIL_INVALID: 'El formato del correo no es válido',
  PASSWORD_REQUIRED: 'La contraseña es obligatoria',
  PASSWORD_MIN: 'La contraseña debe tener al menos 8 caracteres',
  NAME_MIN: 'El nombre debe tener al menos 2 caracteres',
  NAME_MAX: 'El nombre no puede superar los 30 caracteres',
  URL_INVALID: 'El formato de la URL no es válido',
  UNKNOWN_FIELD: 'El campo {#label} no está permitido',
  NOTHING_TO_UPDATE: 'Debes enviar al menos un campo para actualizar',
  ID_REQUIRED: 'Falta el identificador',
  TRACK_ID_REQUIRED: 'El identificador de la pista es obligatorio',
  TITLE_REQUIRED: 'El título es obligatorio',
  ARTIST_REQUIRED: 'El artista es obligatorio',
  OWNER_REQUIRED: 'La pista debe tener un propietario',
};

// --- Reglas de autenticación ---
const AUTH = {
  SALT_ROUNDS: 10,
  TOKEN_TTL: '7d',
  BEARER_PREFIX: 'Bearer ',
};

// --- Reglas de los modelos ---
const USER_RULES = {
  NAME_MIN: 2,
  NAME_MAX: 30,
  PASSWORD_MIN: 8,
  DEFAULT_NAME: 'Melómano anónimo',
};

// Un _id de MongoDB son 24 caracteres hexadecimales
const OBJECT_ID_LENGTH = 24;

// Código que devuelve MongoDB al violar un índice único
const MONGO_DUPLICATE_KEY = 11000;

// --- Limitador de peticiones ---
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100, // por IP y ventana
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES,
  AUTH,
  USER_RULES,
  OBJECT_ID_LENGTH,
  MONGO_DUPLICATE_KEY,
  RATE_LIMIT,
};

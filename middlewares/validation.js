const { celebrate, Joi, Segments } = require('celebrate');

const {
  USER_RULES, OBJECT_ID_LENGTH, VALIDATION_MESSAGES: MSG, ERROR_MESSAGES,
} = require('../utils/constants');

// Joi rechaza por defecto cualquier clave que no esté en el esquema.
// Eso es lo que cierra la puerta al "mass assignment": aunque el
// controlador use req.body entero, nunca llegan campos inesperados.
const noUnknown = { 'object.unknown': MSG.UNKNOWN_FIELD };

// --- Piezas reutilizables (todas opcionales por defecto) ---

const email = Joi.string().email().messages({
  'string.empty': MSG.EMAIL_REQUIRED,
  'any.required': MSG.EMAIL_REQUIRED,
  'string.email': MSG.EMAIL_INVALID,
});

const password = Joi.string().min(USER_RULES.PASSWORD_MIN).messages({
  'string.empty': MSG.PASSWORD_REQUIRED,
  'any.required': MSG.PASSWORD_REQUIRED,
  'string.min': MSG.PASSWORD_MIN,
});

const name = Joi.string().min(USER_RULES.NAME_MIN).max(USER_RULES.NAME_MAX).messages({
  'string.min': MSG.NAME_MIN,
  'string.max': MSG.NAME_MAX,
});

const url = Joi.string().uri().messages({ 'string.uri': MSG.URL_INVALID });

const texto = (mensaje) => Joi.string().messages({
  'string.empty': mensaje,
  'any.required': mensaje,
});

const objectId = Joi.string().required().hex().length(OBJECT_ID_LENGTH)
  .messages({
    'string.hex': ERROR_MESSAGES.INVALID_ID,
    'string.length': ERROR_MESSAGES.INVALID_ID,
    'any.required': MSG.ID_REQUIRED,
  });

// --- Middlewares ---
// .required() se añade aquí, no en las piezas: así el mismo "email"
// sirve para el signup (obligatorio) y para el PATCH (opcional).

module.exports = {
  validateSignup: celebrate({
    [Segments.BODY]: Joi.object({
      name,
      email: email.required(),
      password: password.required(),
    }).messages(noUnknown),
  }),

  validateSignin: celebrate({
    [Segments.BODY]: Joi.object({
      email: email.required(),
      password: password.required(),
    }).messages(noUnknown),
  }),

  validateUpdateProfile: celebrate({
    [Segments.BODY]: Joi.object({ name, email }).min(1).messages({
      ...noUnknown,
      'object.min': MSG.NOTHING_TO_UPDATE,
    }),
  }),

  validateSaveTrack: celebrate({
    [Segments.BODY]: Joi.object({
      trackId: texto(MSG.TRACK_ID_REQUIRED).required(),
      title: texto(MSG.TITLE_REQUIRED).required(),
      artist: texto(MSG.ARTIST_REQUIRED).required(),
      album: Joi.string(),
      cover: url,
      previewUrl: url,
    }).messages(noUnknown),
  }),

  validateTrackId: celebrate({
    [Segments.PARAMS]: Joi.object({ id: objectId }),
  }),
};

const mongoose = require('mongoose');
const validator = require('validator');

const { TRACK_RULES, VALIDATION_MESSAGES } = require('../utils/constants');

const urlValidator = {
  validator: (value) => validator.isURL(value),
  message: VALIDATION_MESSAGES.URL_INVALID,
};

const trackSchema = new mongoose.Schema(
  {
    // Identificador de la pista en la API de música externa
    trackId: {
      type: String,
      required: [true, VALIDATION_MESSAGES.TRACK_ID_REQUIRED],
    },
    // Qué describe la tarjeta. El cliente la renderiza distinto según el tipo.
    type: {
      type: String,
      enum: {
        values: TRACK_RULES.TYPES,
        message: VALIDATION_MESSAGES.TYPE_INVALID,
      },
      required: [true, VALIDATION_MESSAGES.TYPE_REQUIRED],
    },
    title: {
      type: String,
      required: [true, VALIDATION_MESSAGES.TITLE_REQUIRED],
      maxlength: TRACK_RULES.TEXT_MAX,
    },
    artist: {
      type: String,
      required: [true, VALIDATION_MESSAGES.ARTIST_REQUIRED],
      maxlength: TRACK_RULES.TEXT_MAX,
    },
    album: {
      type: String,
      maxlength: TRACK_RULES.TEXT_MAX,
    },
    // Segunda línea de la tarjeta: el artista en un álbum, las suscripciones
    // en un artista. Se guarda ya compuesta porque es texto, no un dato.
    subtitle: {
      type: String,
      maxlength: TRACK_RULES.TEXT_MAX,
    },
    description: {
      type: String,
      maxlength: TRACK_RULES.DESCRIPTION_MAX,
    },
    // Pares etiqueta/valor que la tarjeta muestra como lista de definición
    // ("Albums: 12", "Year: 2019"). El valor es texto o número según la fila.
    stats: {
      type: [
        {
          _id: false,
          label: {
            type: String,
            required: [true, VALIDATION_MESSAGES.STAT_LABEL_REQUIRED],
          },
          value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, VALIDATION_MESSAGES.STAT_VALUE_REQUIRED],
          },
        },
      ],
      default: [],
    },
    // Canciones destacadas del artista o del álbum
    highlights: {
      type: [String],
      default: [],
    },
    cover: {
      type: String,
      validate: urlValidator,
    },
    previewUrl: {
      type: String,
      validate: urlValidator,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, VALIDATION_MESSAGES.OWNER_REQUIRED],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

// Un mismo usuario no puede guardar dos veces la misma pista.
// Si lo intenta, Mongo lanza el error 11000 y el manejador lo traduce a 409.
trackSchema.index({ owner: 1, trackId: 1 }, { unique: true });

module.exports = mongoose.model('track', trackSchema);

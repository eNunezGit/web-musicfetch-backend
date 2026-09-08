const mongoose = require('mongoose');
const validator = require('validator');

const { VALIDATION_MESSAGES } = require('../utils/constants');

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
    title: {
      type: String,
      required: [true, VALIDATION_MESSAGES.TITLE_REQUIRED],
    },
    artist: {
      type: String,
      required: [true, VALIDATION_MESSAGES.ARTIST_REQUIRED],
    },
    album: {
      type: String,
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

const Track = require('../models/track');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

// GET /tracks — solo las pistas guardadas por el usuario autenticado
const getSavedTracks = async (req, res, next) => {
  try {
    const tracks = await Track.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.send(tracks);
  } catch (err) {
    next(err);
  }
};

// POST /tracks
const saveTrack = async (req, res, next) => {
  try {
    const {
      trackId, type, title, artist, album, subtitle,
      description, stats, highlights, cover, previewUrl,
    } = req.body;

    const track = await Track.create({
      trackId,
      type,
      title,
      artist,
      album,
      subtitle,
      description,
      stats,
      highlights,
      cover,
      previewUrl,
      owner: req.user._id,
    });

    res.status(HTTP_STATUS.CREATED).send(track);
  } catch (err) {
    next(err);
  }
};

// DELETE /tracks/:id
const deleteTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id)
      .orFail(new NotFoundError(ERROR_MESSAGES.TRACK_NOT_FOUND));

    // Comparamos como cadena: track.owner es un ObjectId, no un string
    if (track.owner.toString() !== req.user._id) {
      throw new ForbiddenError(ERROR_MESSAGES.NOT_TRACK_OWNER);
    }

    await track.deleteOne();

    res.send({ message: SUCCESS_MESSAGES.TRACK_DELETED });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSavedTracks,
  saveTrack,
  deleteTrack,
};

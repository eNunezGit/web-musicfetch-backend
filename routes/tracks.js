const router = require('express').Router();

const { getSavedTracks, saveTrack, deleteTrack } = require('../controllers/tracks');
const { validateSaveTrack, validateTrackId } = require('../middlewares/validation');

router.get('/', getSavedTracks);
router.post('/', validateSaveTrack, saveTrack);
// :id es el _id del documento guardado, no el trackId de la API externa
router.delete('/:id', validateTrackId, deleteTrack);

module.exports = router;

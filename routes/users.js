const router = require('express').Router();

const { getCurrentUser, updateProfile } = require('../controllers/users');
const { validateUpdateProfile } = require('../middlewares/validation');

router.get('/me', getCurrentUser);
router.patch('/me', validateUpdateProfile, updateProfile);

module.exports = router;

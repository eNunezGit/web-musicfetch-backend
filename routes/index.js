const router = require('express').Router();

const auth = require('../middlewares/auth');
const userRoutes = require('./users');
const trackRoutes = require('./tracks');
const { createUser, login } = require('../controllers/users');
const { validateSignup, validateSignin } = require('../middlewares/validation');
const { ERROR_MESSAGES } = require('../utils/constants');
const NotFoundError = require('../errors/NotFoundError');

// --- Rutas públicas ---
router.post('/signup', validateSignup, createUser);
router.post('/signin', validateSignin, login);

// --- A partir de aquí todo exige token válido ---
router.use(auth);

router.use('/users', userRoutes);
router.use('/tracks', trackRoutes);

// 404: middleware sin ruta. Funciona igual en Express 4 y 5,
// a diferencia de app.get('*') que en Express 5 lanza un TypeError.
router.use((req, res, next) => {
  next(new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND));
});

module.exports = router;

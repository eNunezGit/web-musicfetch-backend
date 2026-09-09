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

// --- Rutas protegidas: exigen token válido ---
// auth se monta en cada grupo y no como un `router.use(auth)` suelto. Con el
// middleware suelto, todo lo que viniera después pasaba primero por el token,
// incluido el 404 de abajo: una ruta inexistente respondía 401 en vez de 404.
router.use('/users', auth, userRoutes);
router.use('/tracks', auth, trackRoutes);

// 404: middleware sin ruta. Funciona igual en Express 4 y 5,
// a diferencia de app.get('*') que en Express 5 lanza un TypeError.
// Dentro de un grupo protegido (/users/loquesea) sigue mandando el token: a
// quien no se ha identificado no le decimos qué subrutas existen y cuáles no.
router.use((req, res, next) => {
  next(new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND));
});

module.exports = router;

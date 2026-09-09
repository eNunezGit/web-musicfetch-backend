const { ERROR_MESSAGES } = require('./constants');

const {
  NODE_ENV = 'development',
  PORT = 3000,
  MONGO_URL = 'mongodb://127.0.0.1:27017/musicfetchdb',
} = process.env;

// En producción el secreto DEBE venir del entorno. Si falta, es mejor
// que el servidor no arranque a que firme tokens con una clave pública.
if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(ERROR_MESSAGES.MISSING_JWT_SECRET);
}

const JWT_SECRET = process.env.JWT_SECRET || 'clave-de-desarrollo-no-usar-en-produccion';

// Orígenes autorizados a llamar a la API desde un navegador.
// Se configuran por entorno para poder añadir el dominio definitivo
// sin tocar el código.
const DEFAULT_ORIGINS = [
  'https://web-musicfetch-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Vercel crea una URL nueva por rama y por commit
// (web-musicfetch-frontend-git-rama-usuario.vercel.app). Sin esto habría
// que añadir a mano cada despliegue de vista previa.
const VERCEL_PREVIEW = /^https:\/\/web-musicfetch-frontend-[a-z0-9-]+\.vercel\.app$/;

module.exports = {
  NODE_ENV,
  PORT,
  MONGO_URL,
  JWT_SECRET,
  ALLOWED_ORIGINS,
  VERCEL_PREVIEW,
};

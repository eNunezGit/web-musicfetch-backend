require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const limiter = require('./middlewares/rate-limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/error-handler');
const {
  PORT, MONGO_URL, ALLOWED_ORIGINS, VERCEL_PREVIEW,
} = require('./utils/config');

const app = express();

// Detrás de nginx todas las peticiones llegan desde 127.0.0.1. Sin esto, el
// limitador contaría a todos los usuarios como una sola IP y uno solo podría
// bloquear a los demás. El 1 son los saltos de confianza: solo nuestro nginx.
app.set('trust proxy', 1);

// Cabeceras de seguridad. Va el primero para que se apliquen también a
// las respuestas de error de los middlewares que vienen después.
app.use(helmet());

// CORS es una protección del NAVEGADOR, no de la API: curl y Postman la
// ignoran por completo. Lo que impide el acceso no autorizado es el token,
// no esta lista. Sirve para que ninguna web ajena pueda usar la sesión
// del usuario desde su navegador.
app.use(cors({
  origin: (origin, callback) => {
    // Sin cabecera Origin: curl, Postman, apps móviles, health checks
    if (!origin) {
      return callback(null, true);
    }

    const permitido = ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW.test(origin);

    // false no lanza error: simplemente no se envían las cabeceras CORS
    // y el navegador bloquea la lectura de la respuesta.
    return callback(null, permitido);
  },
}));

// Antes de express.json: a una petición que vamos a rechazar no le
// dedicamos el trabajo de parsear su cuerpo.
app.use(limiter);

app.use(express.json());

// El orden de estos cuatro middlewares importa:
app.use(requestLogger); // 1. antes de las rutas, para registrarlas todas
app.use(routes); // 2. las rutas
app.use(errorLogger); // 3. captura el error y lo pasa adelante
app.use(errorHandler); // 4. traduce el error a una respuesta JSON

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log(`Conectado a MongoDB en ${MONGO_URL.replace(/\/\/.*@/, '//***@')}`);

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});

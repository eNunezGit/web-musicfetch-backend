# web-musicfetch-backend

API REST para MusicFetch. Registro y autenticación de usuarios con JWT, y
gestión de las pistas que cada usuario guarda.

## Dominio de producción

**https://api.musicfetch.chickenkiller.com**

| | |
|---|---|
| API | https://api.musicfetch.chickenkiller.com |
| Frontend | https://web-musicfetch-frontend.vercel.app |

Ambos apuntan a la misma VM de Google Compute Engine (`34.95.231.70`,
región `southamerica-east1`). El certificado TLS lo emite Let's Encrypt
mediante Certbot y se renueva solo.

## Requisitos

- Node.js 20 o superior
- MongoDB corriendo en local (`mongodb://127.0.0.1:27017`)

## Puesta en marcha

```bash
npm install
cp .env.example .env    # rellena JWT_SECRET
npm run dev
```

El servidor arranca en `http://localhost:3000`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Arranca el servidor con `node` |
| `npm run dev` | Arranca con `nodemon` (recarga al guardar) |
| `npm run lint` | Revisa el estilo con ESLint |
| `npm run lint:fix` | Corrige automáticamente lo que puede |

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | En `production` exige `JWT_SECRET` |
| `PORT` | `3000` | Puerto del servidor |
| `MONGO_URL` | `mongodb://127.0.0.1:27017/musicfetchdb` | Cadena de conexión |
| `JWT_SECRET` | clave de desarrollo | Secreto para firmar los tokens |
| `ALLOWED_ORIGINS` | Vercel + localhost | Orígenes CORS, separados por comas |

## Endpoints

### Públicos

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `POST` | `/signup` | `{ name?, email, password }` | `201` usuario creado (sin contraseña) |
| `POST` | `/signin` | `{ email, password }` | `200` `{ token }` |

### Protegidos

Requieren la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `GET` | `/users/me` | — | `200` usuario actual |
| `PATCH` | `/users/me` | `{ name, email }` | `200` usuario actualizado |
| `GET` | `/tracks` | — | `200` pistas guardadas del usuario |
| `POST` | `/tracks` | `{ trackId, title, artist, album?, cover?, previewUrl? }` | `201` pista guardada |
| `DELETE` | `/tracks/:id` | — | `200` `{ message }` |

## Códigos de error

Todos los errores responden con `{ "message": "..." }`.

| Código | Cuándo |
|---|---|
| `400` | Datos inválidos (los rechaza Joi antes de tocar la BD) |
| `401` | Credenciales incorrectas, token ausente, inválido o caducado |
| `403` | Intento de eliminar una pista de otro usuario |
| `404` | Recurso o ruta inexistente |
| `409` | Correo ya registrado o pista ya guardada |
| `429` | Se superó el límite de peticiones por IP |
| `500` | Error no previsto (el detalle solo va a los logs) |

## Estructura

```
app.js                  Punto de entrada: middlewares, conexión a Mongo, listen
controllers/            Lógica de cada endpoint
models/                 Esquemas de Mongoose
routes/                 Definición de rutas (index.js monta todo)
middlewares/
  auth.js               Verifica el JWT y rellena req.user
  validation.js         Esquemas de Joi/celebrate por endpoint
  rate-limiter.js       Límite de peticiones por IP
  logger.js             Registro de peticiones y de errores
  error-handler.js      Manejador de errores centralizado
errors/                 Clases de error con su statusCode
utils/
  config.js             Lectura y validación de variables de entorno
  constants.js          Mensajes, códigos de estado y valores fijos
```

## Validación

La entrada se valida con [celebrate](https://github.com/arb/celebrate) (Joi) en
`middlewares/validation.js`, **antes** de que la petición llegue al controlador.
Eso significa que un `password` demasiado corto se rechaza sin consultar la base
de datos y sin calcular el hash de bcrypt.

Los esquemas son cerrados: cualquier campo que no esté declarado se rechaza con
un `400`. Es la defensa contra el *mass assignment* (que alguien cuele
`{ "role": "admin" }` en el cuerpo de la petición).

Lo que Joi **no** puede hacer es comprobar el estado de la base de datos. La
unicidad del correo se garantiza en dos capas independientes:

1. `User.findOne({ email })` en el controlador — da un mensaje claro y funciona
   aunque el índice no esté construido.
2. El índice `unique` de MongoDB sobre `email` — es la única garantía real
   frente a dos peticiones simultáneas; su error `11000` se traduce a `409`.

## Aislamiento entre usuarios

`GET /tracks` filtra siempre por `owner: req.user._id`, así que un usuario solo
ve sus propias pistas.

En el borrado se comprueba la propiedad de forma explícita y se responde `403`:

```js
if (track.owner.toString() !== req.user._id) {
  throw new ForbiddenError(ERROR_MESSAGES.NOT_TRACK_OWNER);
}
```

Importante: esto **no** puede delegarse en el frontend. La API es un endpoint
HTTP público — cualquiera con una cuenta puede llamarla con `curl` o Postman
sin pasar por el navegador, así que la comprobación tiene que vivir aquí.

## Registros

Con `express-winston`, en formato JSON y una entrada por línea (NDJSON), así que
se pueden leer con `jq` o cargarlos en cualquier herramienta de análisis.

| Archivo | Contenido |
|---|---|
| `request.log` | **Todas** las peticiones: método, ruta, código de estado y tiempo de respuesta |
| `error.log` | Solo las que terminan en error, con el mensaje y el stack |

Ambos están cubiertos por la regla `*.log` del `.gitignore`, así que nunca
llegan al repositorio.

El orden en `app.js` es lo que hace que funcionen:

```js
app.use(requestLogger);  // 1. antes de las rutas: las registra todas
app.use(routes);         // 2. las rutas
app.use(errorLogger);    // 3. captura el error y lo pasa adelante
app.use(errorHandler);   // 4. traduce el error a JSON para el cliente
```

Dos ajustes en `middlewares/logger.js` que conviene no quitar:

- **`headerBlacklist` y `bodyBlacklist`** excluyen la cabecera `Authorization`
  y el campo `password`. Sin ellos, los tokens y las contraseñas en claro
  acabarían escritos en disco: express-winston registra cabeceras y cuerpo por
  defecto.
- **`trimSystemMeta`** elimina los bloques `os`, `process` y `trace` que
  express-winston añade a cada error. Son unos 3 KB por entrada que no dicen
  nada sobre la petición.

Para leerlos:

```bash
tail -n 20 request.log | jq -c '{msg: .message, body: .meta.req.body}'
```

## CORS

La lista de orígenes autorizados vive en `utils/config.js` y se puede
sobrescribir con la variable `ALLOWED_ORIGINS`:

| Origen | Estado |
|---|---|
| `https://web-musicfetch-frontend.vercel.app` | permitido |
| `https://web-musicfetch-frontend-git-<rama>-<usuario>.vercel.app` | permitido (previews de Vercel) |
| `http://localhost:3000`, `http://localhost:5173` | permitido (desarrollo) |
| cualquier otro | sin cabeceras CORS |

Conviene tener claro qué hace y qué no hace CORS: **es una protección del
navegador, no de la API.** Un origen bloqueado sigue llegando al servidor y se
procesa; lo único que ocurre es que el navegador no deja que el JavaScript de
esa web lea la respuesta. `curl` y Postman ignoran CORS por completo.

Lo que impide de verdad el acceso no autorizado es el token JWT, no esta lista.
CORS sirve para que ninguna web ajena pueda usar la sesión del usuario desde su
navegador.

## Despliegue

| Pieza | Dónde |
|---|---|
| Base de datos | MongoDB Atlas M0 |
| API | VM de Google Compute Engine + nginx + PM2 |
| Dominio | subdominio de freedns.afraid.org |
| Frontend | Vercel |

En `deploy/` están la configuración de nginx (proxy inverso al puerto 3000) y
la de PM2.

### HTTPS con Certbot

Con nginx sirviendo el dominio por el puerto 80:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.musicfetch.chickenkiller.com -d musicfetch.chickenkiller.com
```

Certbot verifica que el dominio apunta a la máquina, emite el certificado,
reescribe la configuración de nginx para escuchar en el 443 y añade la
redirección de HTTP a HTTPS. La renovación queda programada automáticamente;
se comprueba con `sudo certbot renew --dry-run`.

## Seguridad

### Helmet

`app.use(helmet())` es el primer middleware de `app.js`, para que sus
cabeceras se apliquen también a las respuestas de error posteriores.

| Cabecera | Qué evita |
|---|---|
| `Content-Security-Policy` | Ejecución de scripts de orígenes no declarados |
| `X-Content-Type-Options: nosniff` | Que el navegador adivine el tipo de un archivo |
| `Strict-Transport-Security` | Que una futura visita viaje por HTTP sin cifrar |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking: incrustar la API en un iframe ajeno |
| `Referrer-Policy: no-referrer` | Filtrar la URL de origen a terceros |

Helmet también elimina `X-Powered-By`, que delataba que el servidor es Express.

### Limitador de peticiones

En `middlewares/rate-limiter.js`, importado en `app.js`. Los valores están en
`utils/constants.js`: **100 peticiones por IP cada 15 minutos**.

Se monta **antes** de `express.json()`: a una petición que se va a rechazar no
se le dedica el trabajo de parsear el cuerpo. Al superar el límite, la API
responde `429` con el mismo formato `{ message }` que el resto de errores.

`app.js` incluye `app.set('trust proxy', 1)`. Detrás de nginx todas las
peticiones llegan desde `127.0.0.1`, así que sin esa línea el limitador
contaría a todos los usuarios como una sola IP y uno solo podría dejar
bloqueados a los demás. El `1` son los saltos de confianza: únicamente
nuestro nginx.

## Constantes

`utils/constants.js` reúne todo el texto que ve el cliente y todo número que no
se explica solo: códigos de estado, mensajes de error y de éxito, mensajes de
validación, rondas de bcrypt, caducidad del token y los límites del rate
limiter. Ningún mensaje está escrito dentro de la lógica.

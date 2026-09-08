// Configuración de PM2: mantiene el proceso vivo y lo reinicia si se cae.
//   pm2 start deploy/ecosystem.config.js
//   pm2 save && pm2 startup     <- para que sobreviva a un reinicio de la VM
//   pm2 logs musicfetch-api
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'musicfetch-api',
      script: 'app.js',
      // Se calcula desde la ubicación de este archivo: funciona sea cual
      // sea el usuario o la ruta donde se clone el repositorio.
      cwd: path.resolve(__dirname, '..'),
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      // Los registros de la aplicación ya van a request.log y error.log
      // vía express-winston. Estos son los de PM2 (stdout/stderr del proceso).
      error_file: 'pm2-error.log',
      out_file: 'pm2-out.log',
      time: true,
    },
  ],
};

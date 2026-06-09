// require('dotenv').config(); // Load your .env file
const fs = require('fs');
const path = require('path');

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        // Pasamos el contenido del certificado descargado
        ca: fs.readFileSync(path.resolve(__dirname, '../../data/ca-db.pem')).toString()
      }
    }
  }
};
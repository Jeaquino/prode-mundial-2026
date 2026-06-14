require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

function getSslOptions() {
  const caPath = process.env.DB_SSL_CA_PATH || path.join(__dirname, '..', 'certs', 'aiven-ca.pem');
  if (!fs.existsSync(caPath)) return undefined;
  return {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  };
}

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'PRODE',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '3306',
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: {
    ...base,
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: getSslOptions() } : undefined,
  },
  test: {
    ...base,
    database: process.env.DB_NAME || 'PRODE_test',
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: getSslOptions() } : undefined,
  },
  production: {
    ...base,
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: getSslOptions() } : undefined,
  },
};

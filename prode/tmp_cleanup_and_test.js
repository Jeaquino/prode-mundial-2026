const { Sequelize } = require('sequelize');
const fetch = global.fetch;
const cfg = require('./database/config/config.js').development;
const s = new Sequelize(cfg.database, cfg.username, cfg.password, { host: cfg.host, port: cfg.port, dialect: cfg.dialect, logging: false });
(async()=>{
  await s.query("DELETE FROM Usuarios WHERE email IN ('leo@prode.com','leo2@prode.com') OR username IN ('Leonardo Lopez','Leonardo Lopez2')");
  await s.close();
  const creds = { name: 'Leonardo Lopez2', email: 'leo2', password: 'Hola1234' };
  const res = await fetch('http://127.0.0.1:3000/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(creds).toString(),
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log('CREDENCIALES', JSON.stringify(creds));
  const m = text.match(/<p class="form-error">([^<]*)<\/p>/);
  console.log('UI_ERROR', m ? m[1] : 'none');
  console.log('HAS_HOME', text.includes('Prode activo'));
})();

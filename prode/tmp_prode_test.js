const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const cfg = require('./database/config/config.js').development;
const s = new Sequelize(cfg.database, cfg.username, cfg.password, { host: cfg.host, port: cfg.port, dialect: cfg.dialect, logging: false });
(async()=>{
  const Usuario = s.define('Usuario',{username:Sequelize.STRING,email:Sequelize.STRING,password_hash:Sequelize.STRING,rol:Sequelize.STRING},{tableName:'Usuarios',timestamps:true});
  await s.authenticate();
  try {
    const u = await Usuario.create({username:'tmp_validation', email:'tmp_validation@prode.com', password_hash: await bcrypt.hash('Hola1234',10), rol:'usuario'});
    console.log('created', u.id);
  } catch(e) {
    console.error('ERR', e.name, e.errors?.map(x=>({msg:x.message,path:x.path,value:x.value})) || e.parent?.sqlMessage || e.message);
  } finally { await s.close(); }
})();

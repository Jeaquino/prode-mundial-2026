const path = require('node:path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sequelize, Usuario, Equipo, Estadio, Partido, Pronostico } = require('./prode/database/models');

const indexRouter = require('./prode/routes/index');
const usersRouter = require('./prode/routes/users');
const apiRouter = require('./prode/routes/api');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'prode', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'esunsecretomuysecreto',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 },
}));

app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/stylesheets', express.static(path.join(__dirname, 'prode', 'public', 'stylesheets')));
app.use('/images', express.static(path.join(__dirname, 'prode', 'public', 'images')));
app.use('/javascripts', express.static(path.join(__dirname, 'prode', 'public', 'javascripts')));

app.use(async (req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  try {
    res.locals.data = await buildData(req.session.usuario?.id);
  } catch (err) {
    console.error('buildData failed', err);
    res.locals.data = emptyData();
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).send('No encontrado');
});

async function buildData(userId) {
  const [players, teams, venues, matches, leaderboard] = await Promise.all([
    Usuario.findAll({ order: [['username', 'ASC']] }),
    Equipo.findAll({ order: [['grupo', 'ASC'], ['nombre', 'ASC']] }),
    Estadio.findAll({ order: [['nombre', 'ASC']] }),
    Partido.findAll({
      include: [
        { association: 'local', attributes: ['id', 'nombre', 'grupo'] },
        { association: 'visitante', attributes: ['id', 'nombre', 'grupo'] },
        { association: 'estadio', attributes: ['id', 'nombre', 'ciudad', 'pais'] },
      ],
      order: [['fecha_hora', 'ASC']],
    }),
    getLeaderboard(),
  ]);

  const userPronostics = userId
    ? await Pronostico.findAll({ where: { usuario_id: userId } })
    : [];

  const currentDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date());

  return {
    players: players.map((u) => ({ id: u.id, username: u.username, email: u.email, rol: u.rol })),
    teams: teams.map((t) => ({ id: t.id, nombre: t.nombre, codigo_fifa: t.codigo_fifa, grupo: t.grupo })),
    venues: venues.map((v) => ({ id: v.id, nombre: v.nombre, ciudad: v.ciudad, pais: v.pais })),
    matches: matches.map((m) => serializeMatch(m, userPronostics)),
    leaderboard,
    currentDate,
  };
}

function emptyData() {
  return { players: [], teams: [], venues: [], matches: [], leaderboard: [], currentDate: new Date().toISOString() };
}

async function getLeaderboard() {
  const users = await Usuario.findAll({ order: [['username', 'ASC']] });
  const matches = await Partido.findAll({ where: { estado: 'FINALIZADO' } });
  const predictions = await Pronostico.findAll();

  return users
    .map((user) => ({
      id: user.id,
      username: user.username,
      points: matches.reduce((acc, match) => acc + scorePrediction(predictions.find((p) => p.usuario_id === user.id && p.partido_id === match.id), match), 0),
    }))
    .sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
}

function scorePrediction(prediction, match) {
  if (!prediction || match.goles_local == null || match.goles_visitante == null) return 0;
  if (prediction.goles_local_predicho === match.goles_local && prediction.goles_visitante_predicho === match.goles_visitante) return 5;
  const pd = prediction.goles_local_predicho - prediction.goles_visitante_predicho;
  const ad = match.goles_local - match.goles_visitante;
  const ps = Math.sign(pd);
  const as = Math.sign(ad);
  if (ps === 0 && as === 0) return 4;
  if (ps === as && pd === ad) return 4;
  if (ps === as && as !== 0) return 3;
  return 0;
}

function serializeMatch(match, userPronostics) {
  const userPronostic = userPronostics.find((p) => p.partido_id === match.id) || null;
  return {
    id: match.id,
    home: match.local?.nombre || match.equipo_local_id,
    away: match.visitante?.nombre || match.equipo_visitante_id,
    stage: match.fase,
    dateTime: match.fecha_hora,
    stadium: match.estadio?.nombre || null,
    city: match.estadio?.ciudad || null,
    country: match.estadio?.pais || null,
    unlocked: match.estado !== 'PENDIENTE',
    final: match.estado === 'FINALIZADO',
    homeGoals: match.goles_local,
    awayGoals: match.goles_visitante,
    prediction: userPronostic ? {
      homeGoals: userPronostic.goles_local_predicho,
      awayGoals: userPronostic.goles_visitante_predicho,
      points: userPronostic.puntos_obtenidos,
    } : null,
  };
}

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Prode funcionando en http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar la base Sequelize:', err);
    process.exit(1);
  }
})();

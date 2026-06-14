const { Usuario, Equipo, Estadio, Partido, Pronostico } = require('../database/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getDashboard = async (req, res) => {
  const session = getSession(req);
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

  const currentDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date());

  const userPronostics = session?.userId
    ? await Pronostico.findAll({ where: { usuario_id: session.userId } })
    : [];

  res.render('index', {
    title: 'Prode Mundial 2026',
    usuario: session?.user || null,
    data: {
      players: players.map((u) => ({ id: u.id, username: u.username, email: u.email, rol: u.rol })),
      teams: teams.map((t) => ({ id: t.id, nombre: t.nombre, codigo_fifa: t.codigo_fifa, grupo: t.grupo })),
      venues: venues.map((v) => ({ id: v.id, nombre: v.nombre, ciudad: v.ciudad, pais: v.pais })),
      matches: matches.map((m) => serializeMatch(m, userPronostics)),
      leaderboard,
      currentDate,
    },
  });
};

const getLeaderboard = async () => {
  const users = await Usuario.findAll({ order: [['username', 'ASC']] });
  const matches = await Partido.findAll({ where: { estado: 'FINALIZADO' } });
  const predictions = await Pronostico.findAll();

  return users
    .map((user) => {
      const total = matches.reduce((acc, match) => {
        const prediction = predictions.find((p) => p.usuario_id === user.id && p.partido_id === match.id);
        return acc + scorePrediction(prediction, match);
      }, 0);
      return { id: user.id, username: user.username, points: total };
    })
    .sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
};

function serializeMatch(match, userPronostics) {
  const userPronostic = userPronostics.find((p) => p.partido_id === match.id) || null;
  return {
    id: match.id,
    home: match.local?.nombre || match.equipo_local_id,
    away: match.visitante?.nombre || match.equipo_visitante_id,
    group: match.fase === 'GRUPOS' ? (match.local?.grupo || match.visitante?.grupo || null) : null,
    isKnockout: match.fase !== 'GRUPOS',
    stage: match.fase,
    dateTime: match.fecha_hora,
    stadium: match.estadio?.nombre || null,
    city: match.estadio?.ciudad || null,
    country: match.estadio?.pais || null,
    unlocked: match.estado !== 'PENDIENTE',
    final: match.estado === 'FINALIZADO',
    homeGoals: match.goles_local,
    awayGoals: match.goles_visitante,
    prediction: userPronostic
      ? {
          homeGoals: userPronostic.goles_local_predicho,
          awayGoals: userPronostic.goles_visitante_predicho,
          points: userPronostic.puntos_obtenidos,
        }
      : null,
  };
}

function scorePrediction(prediction, match) {
  if (!prediction || match.goles_local == null || match.goles_visitante == null) return 0;
  if (prediction.goles_local_predicho === match.goles_local && prediction.goles_visitante_predicho === match.goles_visitante) {
    return 5;
  }

  const predictedDiff = prediction.goles_local_predicho - prediction.goles_visitante_predicho;
  const actualDiff = match.goles_local - match.goles_visitante;
  const predictedSign = Math.sign(predictedDiff);
  const actualSign = Math.sign(actualDiff);

  if (predictedSign === 0 && actualSign === 0) return 4;
  if (predictedSign === actualSign && predictedDiff === actualDiff) return 4;
  if (predictedSign === actualSign && actualSign !== 0) return 3;
  return 0;
}

function getSession(req) {
  const raw = req.session?.usuario || null;
  if (!raw) return null;
  return {
    userId: raw.id,
    user: { id: raw.id, username: raw.username, email: raw.email, rol: raw.rol },
  };
}

module.exports = { getDashboard };

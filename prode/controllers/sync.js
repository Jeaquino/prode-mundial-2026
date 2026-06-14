require('dotenv').config();
const fetch = global.fetch;
const { Sequelize } = require('sequelize');
const { Partido, Equipo, Estadio, Pronostico, FixtureSync } = require('../database/models');

const WORLD_CUP_BASE = 'https://worldcupapi.com';

function requireAdmin(req, res) {
  if (req.session?.usuario?.rol !== 'admin') {
    res.status(403).json({ message: 'Solo admin' });
    return false;
  }
  return true;
}

async function getSyncStatus(req, res) {
  const last = await FixtureSync.findOne({ order: [['createdAt', 'DESC']] });
  return res.json({ ok: true, lastSync: last || null });
}

async function syncWorldCup(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'Falta api key' });

    const url = `${WORLD_CUP_BASE}/fixtures?key=${encodeURIComponent(key)}`;
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok || payload?.success === false) {
      return res.status(502).json({ message: 'Error externo', external: payload?.error || 'Respuesta invalida' });
    }

    const fixtures = payload.data || payload.fixtures || [];
    let inserted = 0;
    let updated = 0;

    for (const fixture of fixtures) {
      const [home] = await Equipo.findOrCreate({ where: { nombre: fixture.home_team?.name || fixture.home || fixture.team1 }, defaults: { nombre: fixture.home_team?.name || fixture.home || fixture.team1, codigo_fifa: fixture.home_team?.code || fixture.home || fixture.team1, grupo: fixture.group || fixture.stage_group || null } });
      const [away] = await Equipo.findOrCreate({ where: { nombre: fixture.away_team?.name || fixture.away || fixture.team2 }, defaults: { nombre: fixture.away_team?.name || fixture.away || fixture.team2, codigo_fifa: fixture.away_team?.code || fixture.away || fixture.team2, grupo: fixture.group || fixture.stage_group || null } });
      const [stadium] = fixture.stadium?.name ? await Estadio.findOrCreate({ where: { nombre: fixture.stadium.name }, defaults: { nombre: fixture.stadium.name, ciudad: fixture.stadium.city || null, pais: fixture.stadium.country || null } }) : [null];

      const [match, created] = await Partido.findOrCreate({
        where: { fecha_hora: fixture.date || fixture.date_time || fixture.utc_date, equipo_local_id: home.id, equipo_visitante_id: away.id },
        defaults: {
          equipo_local_id: home.id,
          equipo_visitante_id: away.id,
          estadio_id: stadium?.id || null,
          fecha_hora: fixture.date || fixture.date_time || fixture.utc_date,
          fase: fixture.stage || fixture.group || 'GRUPOS',
          goles_local: fixture.score?.home ?? fixture.home_score ?? null,
          goles_visitante: fixture.score?.away ?? fixture.away_score ?? null,
          estado: fixture.status?.short === 'FT' || fixture.finished ? 'FINALIZADO' : 'PENDIENTE',
        },
      });

      if (created) inserted++;
      else {
        await match.update({
          estadio_id: stadium?.id || match.estadio_id,
          fase: fixture.stage || fixture.group || match.fase,
          goles_local: fixture.score?.home ?? fixture.home_score ?? match.goles_local,
          goles_visitante: fixture.score?.away ?? fixture.away_score ?? match.goles_visitante,
          estado: fixture.status?.short === 'FT' || fixture.finished ? 'FINALIZADO' : match.estado,
        });
        updated++;
      }
    }

    await FixtureSync.create({
      source: 'worldcupapi',
      external_id: 'fixtures',
      payload: fixtures,
      synced_at: new Date(),
      action: 'sync-fixtures',
      note: `inserted=${inserted} updated=${updated}`,
    });

    return res.json({ ok: true, inserted, updated, total: fixtures.length });
  } catch (error) {
    return res.status(500).json({ message: 'Error syncing world cup', error: error.message });
  }
}

async function adminUpsertResult(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    const { partido_id, goles_local, goles_visitante, estado } = req.body;
    const match = await Partido.findByPk(partido_id);
    if (!match) return res.status(404).json({ message: 'Partido no encontrado' });

    await match.update({
      goles_local: Number.isInteger(goles_local) ? goles_local : parseInt(goles_local, 10),
      goles_visitante: Number.isInteger(goles_visitante) ? goles_visitante : parseInt(goles_visitante, 10),
      estado: estado || match.estado,
    });

    await FixtureSync.create({
      source: 'manual-admin',
      external_id: String(partido_id),
      payload: { partido_id, goles_local, goles_visitante, estado },
      synced_at: new Date(),
      action: 'manual-result',
      note: 'admin-upsert',
    });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving admin result', error: error.message });
  }
}

module.exports = { syncWorldCup, adminUpsertResult, getSyncStatus };

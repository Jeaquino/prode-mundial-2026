require('dotenv').config();
const { Pronostico, Partido } = require('../database/models');

const savePronostico = async (req, res) => {
  try {
    const session = req.session?.usuario;
    if (!session) return res.status(401).json({ message: 'No autenticado' });

    const { partido_id, goles_local_predicho, goles_visitante_predicho } = req.body;
    const partido = await Partido.findByPk(partido_id);
    if (!partido) return res.status(404).json({ message: 'Partido no encontrado' });

    const existing = await Pronostico.findOne({ where: { usuario_id: session.id, partido_id } });
    if (existing) {
      return res.status(409).json({ message: 'Pronostico ya guardado' });
    }

    await Pronostico.create({
      usuario_id: session.id,
      partido_id,
      goles_local_predicho: parseInt(goles_local_predicho, 10),
      goles_visitante_predicho: parseInt(goles_visitante_predicho, 10),
      puntos_obtenidos: 0,
    });

    return res.json({ ok: true, locked: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving prediction', error: error.message });
  }
};

module.exports = { savePronostico };

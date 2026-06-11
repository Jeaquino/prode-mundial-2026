const express = require('express');
const router = express.Router();
const {getAllMatchs,getMatcsPaginate} = require('../controllers/partidos');
const { getAllUsers } = require('../controllers/usuarios');
const { getAllPartidos } = require('../controllers/partidos');
const isAdmin = require('../middleware/isAdmin');
const db = require('../database/models');

/* GET home page. */
router.get('/matchs', getAllMatchs);
router.get('/matchs/paginate', getMatcsPaginate);

// Endpoints para admin
router.get('/usuarios', isAdmin, getAllUsers);
router.patch('/usuarios/:id', isAdmin, async (req, res) => {
  try {
    const { nombre, email, pin, es_admin } = req.body;
    const usuario = await db.Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await usuario.update({
      nombre: nombre || usuario.nombre,
      email: email || usuario.email,
      pin: pin || usuario.pin,
      es_admin: es_admin !== undefined ? es_admin : usuario.es_admin
    });
    
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.get('/partidos', isAdmin, getAllPartidos);
router.patch('/partidos/:id', isAdmin, async (req, res) => {
  try {
    const { equipo_local, equipo_visitante, fecha, goles_local, goles_visitante } = req.body;
    const partido = await db.Partido.findByPk(req.params.id);
    
    if (!partido) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    
    await partido.update({
      equipo_local: equipo_local || partido.equipo_local,
      equipo_visitante: equipo_visitante || partido.equipo_visitante,
      fecha: fecha || partido.fecha,
      goles_local: goles_local !== undefined ? goles_local : partido.goles_local,
      goles_visitante: goles_visitante !== undefined ? goles_visitante : partido.goles_visitante
    });
    
    res.json(partido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar partido' });
  }
});

module.exports = router;

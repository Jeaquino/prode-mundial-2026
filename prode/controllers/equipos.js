// require('dotenv').config();
const { Equipo } = require('../models');

const getAllEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.findAll();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipos', error });
  }
};

const getEquipoById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ message: 'Equipo not found' });
    }
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipo', error });
  }
};

module.exports = { getAllEquipos, getEquipoById };
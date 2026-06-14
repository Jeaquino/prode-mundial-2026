require('dotenv').config();
const { Estadio } = require('../models');

const getAllEstadios = async (req, res) => {
    try {
        const estadios = await Estadio.findAll();
        res.json(estadios);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching estadios', error });
    }
};

module.exports = { getAllEstadios };
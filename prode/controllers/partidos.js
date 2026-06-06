require('dotenv').config();
const { User } = require('../models');

const getAllMatchs = async (req, res) => {
    try {
        const matchs = await Match.findAll();
        res.json(matchs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matchs', error });
    }
};

const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await Match.findByPk(id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.json(match);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching match', error });
    }
};

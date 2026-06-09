// require('dotenv').config();
const { Partido } = require('../database/models');

const getAllMatchs = async (req, res) => {
    try {
        const matchs = await Partido.findAll({
            include: [
                { association: 'local', attributes: ['id', 'nombre'] },
                { association: 'visitante', attributes: ['id', 'nombre'] },
                { association: 'estadio', attributes: ['id', 'nombre', 'ciudad'] }],
        }).catch(err => {
            console.error('Error fetching matchs:', err);
            throw err;
        });
        res.status(200).json(matchs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matchs', error });
    }
};

const getMatcsPaginate = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const { count, rows } = await Partido.findAndCountAll({
            include: [
                { association: 'local', attributes: ['id', 'nombre'] },
                { association: 'visitante', attributes: ['id', 'nombre'] },
                { association: 'estadio', attributes: ['id', 'nombre', 'ciudad'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_hora', 'ASC']]
        }).catch(err => {
            console.error('Error fetching paginated matchs:', err);
            throw err;
        });
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            matchs: rows
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching paginated matchs', error });
    }
};

const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await Partido.findByPk(id).catch(err => {
            console.error('Error fetching match:', err);
            throw err;
        });
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching match', error });
    }
};

module.exports = { getAllMatchs, getMatchById, getMatcsPaginate };
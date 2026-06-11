require('dotenv').config();
const { Partido, Pronostico } = require('../database/models');

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

const updateMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { goles_local, goles_visitante } = req.body;
        const match = await Partido.findByPk(id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        match.goles_local = goles_local;
        match.goles_visitante = goles_visitante;
        await match.save();
        res.status(200).json({ message: 'Match updated successfully', match });
    } catch (error) {
        res.status(500).json({ message: 'Error updating match', error });
    }
};

const generatePronostico = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await Partido.findByPk(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        let pronostico = await Pronostico.findOne({ where: { partido_id: match.id } });
        
        if (pronostico) {
            return res.status(200).json(pronostico);
        }

        pronostico = await Pronostico.create({
            partido_id: match.id,
            goles_local: match.goles_local,
            goles_visitante: match.goles_visitante,
            resultado: match.goles_local > match.goles_visitante ? 'local' : match.goles_local < match.goles_visitante ? 'visitante' : 'empate'
        });
        res.status(201).json(pronostico);
    } catch (error) {
        console.error('Error generating pronostico:', error);
        res.status(500).json({ message: 'Error generating pronostico', error });
    }
};

const getAllPartidos = async (req, res) => {
    try {
        const partidos = await Partido.findAll({
            order: [['fecha', 'ASC']]
        });
        res.status(200).json(partidos);
    } catch (error) {
        console.error('Error fetching partidos:', error);
        res.status(500).json({ message: 'Error fetching partidos', error });
    }
};

const updatePartido = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipo_local, equipo_visitante, fecha, goles_local, goles_visitante } = req.body;
        const partido = await Partido.findByPk(id);
        if (!partido) {
            return res.status(404).json({ message: 'Partido not found' });
        }
        
        await partido.update({
            equipo_local: equipo_local || partido.equipo_local,
            equipo_visitante: equipo_visitante || partido.equipo_visitante,
            fecha: fecha || partido.fecha,
            goles_local: goles_local !== undefined ? goles_local : partido.goles_local,
            goles_visitante: goles_visitante !== undefined ? goles_visitante : partido.goles_visitante
        });
        
        res.status(200).json(partido);
    } catch (error) {
        console.error('Error updating partido:', error);
        res.status(500).json({ message: 'Error updating partido', error });
    }
};

module.exports = { getAllMatchs, getMatchById, getMatcsPaginate, updateMatch, getAllPartidos, updatePartido };
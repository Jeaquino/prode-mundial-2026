require('dotenv').config();
const { Partido, Pronostico } = require('../database/models');

const getAllPronosticos = async (req, res) => {
    const { userId } = req.params;
    try {
        const pronosticos = await Pronostico.findAll({
            where: { usuario_id: userId },
            include: [
                {
                    association: 'partido', include: [
                        { association: 'local', attributes: ['id', 'nombre'] },
                        { association: 'visitante', attributes: ['id', 'nombre'] },
                        { association: 'estadio', attributes: ['id', 'nombre', 'ciudad'] }
                    ]
                }
            ]
        });
        res.status(200).json(pronosticos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pronosticos', error });
    }
};

const generatePronostico = async (req, res) => {
    try {
        const { matchId,userId } = req.body;

        const match = await Partido.findByPk(matchId);
        
        if (!match) {
            throw new Error('Match not found');
        }

        let pronostico;

        pronostico = await Pronostico.findOne({ where: { partido_id: match.id, usuario_id: userId } });

        if (pronostico) {
            return res.status(400).json({ message: 'Pronostico already exists for this match and user' });
        }

        pronostico = await Pronostico.create({
            partido_id: match.id,
            goles_local: match.goles_local,
            goles_visitante: match.goles_visitante,
            // resultado: match.goles_local > match.goles_visitante ? 'local' : match.goles_local < match.goles_visitante ? 'visitante' : 'empate'
        });
        res.status(201).json(pronostico);
    } catch (error) {
        console.error('Error generating pronostico:', error);
        res.status(500).json({ message: 'Error generating pronostico', error });
    }
};

module.exports = { generatePronostico };

require('dotenv').config();

const { Usuario, Partido } = require('../database/models');

const adminGetPanel = async (req, res) => {
  try {
    const users = await Usuario.findAll();
    const partidos = await Partido.findAll({
      include: [
        { association: 'local', attributes: ['id', 'nombre'] },
        { association: 'visitante', attributes: ['id', 'nombre'] },
        { association: 'estadio', attributes: ['id', 'nombre', 'ciudad'] }],

    });
    console.log('Users:', users);
    console.log('Partidos:', partidos);

    res.render('adminPanel', { users, partidos, user: req.session.user, title: 'Admin Panel' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

const adminGetAllUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

const adminUpdateUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, password, rol } = req.body;
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      username: name,
      password_hash: hashedPassword,
      rol
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

const adminUpdateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { golesLocal, golesVisitante } = req.body;
    const match = await Partido.findByPk(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    await match.update({
      goles_local: golesLocal,
      goles_visitante: golesVisitante,
    });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error updating match', error });
  }
};



module.exports = { adminUpdateUser, adminUpdateMatch, adminGetPanel, adminGetAllUsers, adminUpdateUser, adminUpdateMatch };
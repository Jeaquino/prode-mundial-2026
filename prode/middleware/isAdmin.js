const isAdmin = (req, res, next) => {
  if (req.session.usuario && req.session.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = isAdmin;
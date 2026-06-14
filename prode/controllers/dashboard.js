const getDashboard = (req, res) => {

  if (!req.session.autenticado) {
    res.render('index',{title: 'Prode Mundial 2026'});
  } else {
    res.render('index', { usuario: req.session.usuario,title: 'Prode Mundial 2026' });
  }
};

module.exports = { getDashboard };
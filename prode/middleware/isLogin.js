const loginVerify = (req, res, next) => {
    if (req.session.autenticado) {
        next();
    } else {
        res.redirect("/users/login");
    }
};

module.exports = loginVerify;
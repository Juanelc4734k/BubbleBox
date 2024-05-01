const userModel = require('../models/userModel');

exports.register = (req, res) => {
    const { username, password } = req.boby;
    userModel.createUser(username, password, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'Error al registrar'});
        } else {
            res.status(200).json({message: 'Usuario registrado'});
        }
    });
};

exports.login = (req, res) => {
    const { username, password } = req.boby;
    userModel.authenticateUser(username, password, (err, result) => {
        if (err || !result) {
            res.status(401).json({message: 'Credenciales invalidas'});
        } else {
            res.status(200).json({message: 'Inicio de sesion exitoso'});
        }
    });
};


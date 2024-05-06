const userModel = require('../models/userModel');

exports.register = (req, res) => {
    const { nombre, email, telefono, contraseña } = req.body; // Corregir req.boby a req.body
    userModel.createUser(nombre, email, telefono, contraseña, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'Error al registrar'});
        } else {
            res.status(200).json({message: 'Usuario registrado'});
        }
    });
};

exports.login = (req, res) => {
    const { nombre, contraseña } = req.body; // Corregir req.boby a req.body
    userModel.authenticateUser(nombre, contraseña, (err, result) => {
        if (err || !result) {
            res.status(401).json({message: 'Credenciales inválidas'});
        } else {
            res.status(200).json({message: 'Inicio de sesión exitoso'});
        }
    });
};

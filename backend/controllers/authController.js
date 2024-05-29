const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
    const { nombre, contraseña } = req.body; // Corregido de req.boby a req.body
    userModel.authenticateUser(nombre, contraseña, (err, result) => {
        if (err || !result) {
            res.status(401).json({ message: 'Credenciales inválidas' });
        } else {
            // Verifica el tipo de usuario
            userModel.getUserRole(nombre, (err, rol) => {
                if (err) {
                    res.status(500).json({ message: 'Error al obtener el rol del usuario' });
                } else {
                    const token = jwt.sign({ nombre, rol }, 'secreto');
                    let message = '';
                    if (rol === 'Administrador') {
                        message = 'Inicio de sesión exitoso como administrador.';
                    } else if (rol === 'Super_Administrador') {
                        message = 'Inicio de sesión exitoso como super administrador.';
                    } else if (rol === 'Usuario') {
                        message = 'Inicio de sesión exitoso';
                    } else if (rol === 'Empleado') {
                        message = 'Inicio de sesión exitoso como empleado';
                    } else {
                        message = 'No existe el rol';
                    }
                    res.status(200).json({ message: message, rol: rol, token: token});
                }
            });
        }
    });
};
const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/user');
const router = express.Router();

router.get('/profile', auth(['user', 'admin', 'superadmin', 'employee']), async (req, res) => {
    try {
        // Buscar al usuario en la base de datos utilizando el ID del token
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Devolver la información del usuario, incluyendo el nombre de usuario
        res.json({ message: 'Perfil de Usuario', user: { id: user.id, username: user.username, role: req.user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;

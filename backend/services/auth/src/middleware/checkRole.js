const checkRol = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
        }
        next();
    };
};

module.exports = checkRol;
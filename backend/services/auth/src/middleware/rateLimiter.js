const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 6,
    message: 'Demasiadas solicitudes, por favor intenta nuevamente en 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;
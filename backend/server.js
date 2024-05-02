const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes')
const db = require('./db');
const { register, login } = require('./controllers/authController');

//Middlewares
app.use(express.json());
app.use(cors());

// Rutas de autenticación
app.post('/register', register); // Maneja la solicitud POST a /auth/register
app.post('/auth/login', login); // Maneja la solicitud POST a /auth/login

//Puerto
app.listen(8081, () => {
    console.log("Puerto en escucha")
})
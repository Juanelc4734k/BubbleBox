// Importar las dependencias necesarias
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

// Crear una instancia de Express
const app = express();

// Configurar CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET, POST, PUT',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

//routes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
app.use('/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3010 ;
// console.log('Ruta actual:', __dirname);
// console.log('JWT_SECRET:', process.env.JWT_SECRET);

app.listen(PORT, () => console.log(`Service Auht running on port ${PORT}`));
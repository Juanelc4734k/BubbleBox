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
    
    next();
});
app.use('/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3010 ;
// 
// 

app.listen(PORT, () => );
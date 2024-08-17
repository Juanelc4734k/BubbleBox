const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });
const db = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/users', userRoutes);

const PORT = process.env.USERS_PORT || 3009;

app.listen(PORT, () => console.log(`Service Users running on port ${PORT}`));

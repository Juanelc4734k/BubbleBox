const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.USERS_PORT || 3009;

app.listen(PORT, () => console.log(`Service Users running on port ${PORT}`));

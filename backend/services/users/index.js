const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Middlewares
app.use(cors());
app.use(express.json());

// Update the static files path
app.use('/users', userRoutes);

const PORT = process.env.USERS_PORT || 3009;

app.listen(PORT, () => );

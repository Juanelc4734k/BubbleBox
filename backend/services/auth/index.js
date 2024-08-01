const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/auth', authRoutes);


const PORT = process.env.AUTH_PORT || 3010 ;

app.listen(PORT, () => console.log(`Service Auht running on port ${PORT}`));

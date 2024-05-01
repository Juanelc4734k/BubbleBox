const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes')
const db = require('./db');

//Middlewares
app.use(cors());

//Routes
app.use('/auth', authRoutes);

//Puerto
app.listen(8081, () => {
    console.log("Puerto en escucha")
})
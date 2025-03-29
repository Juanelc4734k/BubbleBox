const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const storiesRoutes = require('./src/routes/storiesRoutes');

const app = express();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Middlewares
app.use(cors());
app.use(express.json());

app.use('/stories', storiesRoutes);

const PORT = process.env.STORIES_PORT || 3003;

app.listen(PORT, () => console.log(`Service Stories running on port ${PORT}`));

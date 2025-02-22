const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const reelsRoutes = require('./src/routes/reelsRoutes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.use('/reels', reelsRoutes);

const PORT = process.env.REELS_PORT || 3002;

app.listen(PORT, () => console.log(`Service Reels running on port ${PORT}`));

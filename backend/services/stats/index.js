const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const statsRoutes = require('./src/routes/statsRoutes');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

app.use('/stats', statsRoutes);

const PORT = process.env.STATS_PORT || 3013;

app.listen(PORT, () => console.log(`Service Users running on port ${PORT}`));

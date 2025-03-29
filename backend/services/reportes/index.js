const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const reportsRoutes = require('./src/routes/reportsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/reports', reportsRoutes);


const PORT = process.env.REPORTS_PORT || 3015;

app.listen(PORT, () => );

const express = require('express');
const cors = require('cors');
const path = require('path')
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const backupRoutes = require('./src/routes/backupRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/backups', backupRoutes);

const PORT = process.env.BACKUPS_PORT || 3014;

app.listen(PORT, () => );

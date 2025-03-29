const express = require('express');
const cors = require('cors');
const path = require('path')
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const communityRoutes = require('./src/routes/communityRoutes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.use('/communities', communityRoutes);

const PORT = process.env.COMMU_PORT || 3004;

app.listen(PORT, () => console.log(`Service Communities running on port ${PORT}`));

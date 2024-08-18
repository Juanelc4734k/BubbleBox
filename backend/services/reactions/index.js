const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const reactionsRoutes = require('./src/routes/reactionsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/reactions', reactionsRoutes);

const PORT = process.env.REACTIONS_PORT || 3012;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));





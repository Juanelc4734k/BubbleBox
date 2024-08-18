const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const commentsRoutes = require('./src/routes/commentsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/comments', commentsRoutes);

const PORT = process.env.COMMENTS_PORT || 3011;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));





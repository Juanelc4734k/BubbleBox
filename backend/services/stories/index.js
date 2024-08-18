const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const storiesRoutes = require('./src/routes/storiesRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/stories', storiesRoutes);

const PORT = process.env.STORIES_PORT || 3003;


app.listen(PORT, () => console.log(`Service Stories running on port ${PORT}`));

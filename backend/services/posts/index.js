const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const postRoutes = require('./src/routes/postRoutes');


const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/posts', postRoutes);

const PORT = process.env.POSTS_PORT || 3008;

app.listen(PORT, () => console.log(`Service Posts running on port ${PORT}`));

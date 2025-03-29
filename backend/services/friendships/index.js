const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const friendRoutes = require('./src/routes/friendRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/friendships', friendRoutes);

const PORT = process.env.FRIENDSHIPS_PORT || 3005;

app.listen(PORT, () => console.log(`Service FriendShips running on port ${PORT}`));

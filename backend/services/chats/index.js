const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });
const db = require('./src/config/db');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//routes


const PORT =  process.env.CHATS_PORT || 3001;
app.listen(PORT, () => console.log(`Service Chats running on port ${PORT}`));

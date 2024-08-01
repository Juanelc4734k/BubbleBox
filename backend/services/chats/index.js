const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Service Chats is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Chats running on port ${PORT}`);
});

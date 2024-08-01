const express = require('express');
const app = express();
const PORT = 3006;

app.get('/', (req, res) => {
  res.send('Service Player-music is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Player-music running on port ${PORT}`);
});

const express = require('express');
const app = express();
const PORT = 3002;

app.get('/', (req, res) => {
  res.send('Service Reels is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Reels running on port ${PORT}`);
});

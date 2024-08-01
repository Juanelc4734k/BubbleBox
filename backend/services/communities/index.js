const express = require('express');
const app = express();
const PORT = 3004;

app.get('/', (req, res) => {
  res.send('Service Communities is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Communities running on port ${PORT}`);
});

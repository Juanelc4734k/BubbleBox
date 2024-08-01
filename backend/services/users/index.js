const express = require('express');
const app = express();
const PORT = 3009;

app.get('/', (req, res) => {
  res.send('Service Users is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Users running on port ${PORT}`);
});

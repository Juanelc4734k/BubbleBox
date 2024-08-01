const express = require('express');
const app = express();
const PORT = 3008;

app.get('/', (req, res) => {
  res.send('Service Posts is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Posts running on port ${PORT}`);
});

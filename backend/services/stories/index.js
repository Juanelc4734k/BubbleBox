const express = require('express');
const app = express();
const PORT = 3003;

app.get('/', (req, res) => {
  res.send('Service Stories is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Stories running on port ${PORT}`);
});

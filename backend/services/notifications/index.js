const express = require('express');
const app = express();
const PORT = 3007;

app.get('/', (req, res) => {
  res.send('Service Notifications is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service Notifications running on port ${PORT}`);
});

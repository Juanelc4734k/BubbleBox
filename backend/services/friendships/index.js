const express = require('express');
const app = express();
const PORT = 3005;

app.get('/', (req, res) => {
  res.send('Service FriendShips is up and running!');
});

app.listen(PORT, () => {
  console.log(`Service FriendShips running on port ${PORT}`);
});

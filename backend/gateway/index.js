const express = require('express');
const setupProxies = require('./src/middlewares/proxy');
const routes = require('./src/routes/index');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

setupProxies(app);
app.use('/api', routes);

app.listen(PORT, () => {
    
})


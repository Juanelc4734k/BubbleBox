const { createProxyMiddleware } = require('http-proxy-middleware');
const servicesConfig = require('../config/config');

const setupProxies = (app) => {
    Object.keys(servicesConfig).forEach(service => {
        const config = servicesConfig[service]
        app.use(`/${service}`, (req, res, next) => {
            
            next();
        }, createProxyMiddleware(config));
    });
};

module.exports = setupProxies;

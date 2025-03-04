const statsModel = require('../models/statsModel');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await statsModel.getDailyStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener estadísticas', 
            error: error.message 
        });
    }
};

const getCountPostsToday = async (req, res) => {
    try {
        const count = await statsModel.getCountPostsToday();
        res.json({ count });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el conteo de publicaciones',
            error: error.message
        });
    }
};

const getTotalComents = async (req, res) => {
    try {
        const count = await statsModel.getTotalComents();
        res.json({ count });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el conteo de comentarios',
            error: error.message
        });
    }
};

const getPostsFeatured = async (req, res) => {
    try {
        const count = await statsModel.getPostsFeatured();
        res.json({ count });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el conteo de publicaciones destacadas',
            error: error.message
        });
    }
};

const getUsersSummary = async (req, res) => {
    try {
        const summary = await statsModel.getUsersSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el resumen de usuarios',
            error: error.message
        });
    }
};

const getUsersSummaryGrowth = async (req, res) => {
    try {
        const summary = await statsModel.getGrowthStatsUsuarios();
        res.json(summary);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el resumen de usuarios',
            error: error.message
        });
    }
};

const getUsersFeatured = async (req, res) => {
    try {
        const featuredUsers = await statsModel.getUsersFeatured();
        res.json(featuredUsers);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los usuarios destacados',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getCountPostsToday,
    getTotalComents,
    getPostsFeatured,
    getUsersSummary,
    getUsersSummaryGrowth,
    getUsersFeatured
};
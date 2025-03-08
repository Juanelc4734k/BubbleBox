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

const getGrowthStatsComments = async (req, res) => {
    try {
        const stats = await statsModel.getGrowthStatsComentarios();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las estadísticas de crecimiento',
            error: error.message
        });
    }
};

const getCountCommentsByType = async (req, res) => {
    try {
        const type = req.params.type;
        const count = await statsModel.getCountCommentsByType(type);
        res.json({ count });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el conteo de comentarios por tipo',
            error: error.message
        });
    }
};

const getCommentsMonthly = async (req, res) => {
    try {
        const comments = await statsModel.getCommentsMonthly();
        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los comentarios mensuales',
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

const getReelsStats = async (req, res) => {
    try {
        const stats = await statsModel.getReelsGrowthStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las estadísticas de reels',
            error: error.message
        });
    }
};

const getReelsSummary = async (req, res) => {
    try {
        const summary = await statsModel.getReelsSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el resumen de reels',
            error: error.message
        });
    }
};

const getGrowthStatsPublicaciones = async (req, res) => {
    try {
        const stats = await statsModel.getGrowthStatsPublicaciones();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las estadísticas de crecimiento',
            error: error.message
        });
    }
};

const getPostsMontly = async (req, res) => {
    try {
        const posts = await statsModel.getPostsMontly();
        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los posts mensuales',
            error: error.message
        });
    }
};

const getPostCount = async (req, res) => {
    try {
        const count = await statsModel.getPostCount();
        res.json({ count });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el conteo de publicaciones',
            error: error.message
        });
    }
};

const getCommunitiesSummary = async (req, res) => {
    try {
        const summary = await statsModel.getCommunitiesSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el resumen de comunidades',
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
    getUsersFeatured,
    getReelsStats,
    getReelsSummary,
    getGrowthStatsComments,
    getGrowthStatsPublicaciones,
    getCountCommentsByType,
    getCommentsMonthly,
    getPostsMontly,
    getPostCount,
    getCommunitiesSummary
};
const express = require('express');
const router = express.Router();
const statsControllers = require('../controllers/statsController');

router.get('/getStats', statsControllers.getDashboardStats);
router.get('/posts/today', statsControllers.getCountPostsToday);
router.get('/posts/featured', statsControllers.getPostsFeatured);
router.get('/comentarios/total', statsControllers.getTotalComents);
router.get('/users/summary', statsControllers.getUsersSummary);
router.get('/users/stats', statsControllers.getUsersSummaryGrowth);
router.get('/users/featured', statsControllers.getUsersFeatured);
router.get('/reels/stats', statsControllers.getReelsStats);
router.get('/reels/summary', statsControllers.getReelsSummary);

module.exports = router;
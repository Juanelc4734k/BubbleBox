const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// PDF generation routes
router.post('/users', pdfController.generateUsersPDF);
router.post('/publications', pdfController.generatePublicationsPDF);
router.post('/reels', pdfController.generateReelsPDF);
router.post('/reports', pdfController.generateReportsPDF);

module.exports = router;
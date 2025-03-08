const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Create a new report
router.post('/crear', reportsController.createReport);

// Get all reports with optional filtering and pagination
router.get('/obtener', reportsController.getReports);

// Get a single report by ID
router.get('/obtener/:id', reportsController.getReportById);

// Count total reports with optional filtering
router.get('/count', reportsController.countReports);

// Get report statistics
router.get('/stats', reportsController.getReportStats);

// Resolve or update a report
router.put('/resolver/:id', reportsController.resolveReport);

// Delete a report
router.delete('/eliminar/:id', reportsController.deleteReport);

module.exports = router;
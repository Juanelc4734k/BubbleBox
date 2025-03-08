const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const upload = require('../middleware/multer');


// Create a new backup
router.post('/create', backupController.createBackup);

// Upload a backup file
router.post('/upload', upload.single('backupFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            mensaje: 'No se ha subido ningún archivo'
        });
    }
    
    // Use the model to register the uploaded backup
    backupController.registerUploadedBackup(req, res);
});

// Get all backups
router.get('/list', backupController.getBackups);

// Get backup statistics
router.get('/stats', backupController.getBackupStats);

// Restore from a backup
router.post('/restore/:filename', backupController.restoreBackup);

// Download a backup file
router.get('/download/:filename', backupController.downloadBackup);

// Delete a backup
router.delete('/delete/:filename', backupController.deleteBackup);

module.exports = router;
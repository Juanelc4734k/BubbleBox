const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../files');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, backupDir);
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${req.body.name || 'backup'}_${timestamp}${path.extname(file.originalname)}`;
        req.backupFilename = filename; // Store filename for later use
        cb(null, filename);
    }
});

// File filter to only accept SQL files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/sql' || 
        file.originalname.endsWith('.sql') || 
        file.mimetype === 'application/octet-stream') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos SQL'), false);
    }
};

// Create multer instance
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

module.exports = upload;
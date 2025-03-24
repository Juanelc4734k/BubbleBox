const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define file size limits
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB default limit

// Create storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine destination folder based on file type
        let folderPath;
        
        if (file.mimetype.startsWith('audio/')) {
            folderPath = path.join(__dirname, '../../uploads/audios');
        } else if (file.mimetype.startsWith('video/')) {
            folderPath = path.join(__dirname, '../../uploads/videos');
        } else if (file.mimetype.startsWith('image/')) {
            folderPath = path.join(__dirname, '../../uploads/images');
        } else if (file.mimetype.startsWith('application/pdf')) {
            folderPath = path.join(__dirname, '../../uploads/documents/pdf');
        } else if (file.mimetype.includes('spreadsheet') || 
                  file.mimetype.includes('excel') || 
                  file.mimetype.endsWith('sheet')) {
            folderPath = path.join(__dirname, '../../uploads/documents/spreadsheets');
        } else if (file.mimetype.includes('document') || 
                  file.mimetype.includes('word') || 
                  file.mimetype.endsWith('document')) {
            folderPath = path.join(__dirname, '../../uploads/documents/word');
        } else if (file.mimetype.includes('presentation') || 
                  file.mimetype.includes('powerpoint')) {
            folderPath = path.join(__dirname, '../../uploads/documents/presentations');
        } else {
            folderPath = path.join(__dirname, '../../uploads/documents/other');
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        cb(null, fileName);
    }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
    // Define allowed mime types
    const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'application/rtf',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
        // Video
        'video/mp4', 'video/webm', 'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Create multer upload instance with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT
    },
    fileFilter: fileFilter
});

// Export the configured multer instance
module.exports = upload;

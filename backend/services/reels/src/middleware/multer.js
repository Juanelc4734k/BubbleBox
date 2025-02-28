const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, '../../uploads');
        const fs = require('fs');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `reel-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de video (MP4, MOV, AVI)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 50 * 1024 * 1024
    }
});

// Create a wrapper middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('archivo_video');  // Changed from 'video' to 'archivo_video'
    
    uploadSingle(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                mensaje: "Error en la subida del archivo",
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                mensaje: "Error en la subida del archivo",
                error: err.message
            });
        }
        next();
    });
};

module.exports = uploadMiddleware;
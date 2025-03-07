const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determinar la carpeta de destino según el tipo de archivo
        let folderPath;
        if (file.mimetype.startsWith('audio/')) {
            folderPath = path.join(__dirname, '../../uploads/audios');
        } else if (file.mimetype.startsWith('video/')) {
            folderPath = path.join(__dirname, '../../uploads/videos');
        } else if (file.mimetype.startsWith('image/')) {
            folderPath = path.join(__dirname, '../../uploads/images');
        } else {
            folderPath = path.join(__dirname, '../../uploads');
        }
        
        const fs = require('fs');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;

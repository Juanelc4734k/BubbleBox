const backupModel = require('../models/backupModel');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const backupDir = path.join(__dirname, '../../files');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, {
        recursive: true,
    });
}

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || 'bubblebox2';

const createBackup = async (req, res) => {
    try {
        const { name } = req.body;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name || 'backup'}-${timestamp}.sql`;
        const filePath = path.join(backupDir, filename);

        // Fix the path with proper backslashes
        const mysqlDumpPath = 'C:\\wamp64\\bin\\mysql\\mysql9.1.0\\bin\\mysqldump.exe';
        
        // Important: When using -p with a password, there should be NO space between -p and the password
        const command = `"${mysqlDumpPath}" -h ${dbHost} -u ${dbUser} ${dbPass ? `-p${dbPass}` : ''} ${dbName} > "${filePath}"`;

        // Execute the command with a longer timeout
        const { stdout, stderr } = await execPromise(command, { timeout: 60000 });
        
        // Fix the userId check
        await backupModel.createBackup(filename, req.usuario && req.usuario.userId ? req.usuario.userId : null);

        res.status(200).json({
            success: true,
            mensaje: 'Backup creado exitosamente',
            filename
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        
        // Check for specific error conditions
        if (error.message && error.message.includes('no se reconoce como un comando interno o externo')) {
            return res.status(500).json({
                success: false,
                mensaje: 'Error al crear el backup: mysqldump no encontrado',
                error: 'Asegúrate de que MySQL está instalado y la ruta es correcta'
            });
        }
        
        // Check for timeout
        if (error.killed && error.signal === 'SIGTERM') {
            return res.status(500).json({
                success: false,
                mensaje: 'Error al crear el backup: el proceso ha tardado demasiado tiempo',
                error: 'Intenta de nuevo o contacta al administrador del sistema'
            });
        }
        
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el backup',
            error: error.message
        });
    }
}

const getBackups = async (req, res) => {
    try {
        const backups = await backupModel.getBackups();

        const backupsWithDetails = backups.map(backup => {
            const filePath = path.join(backupDir, backup.filename);
            const fileExists = fs.existsSync(filePath);
            const fileSize = fileExists ? fs.statSync(filePath).size : 0;

            return {
                ...backup,
                fileExists,
                fileSize: fileSize ? (fileSize / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB'
            };
        });

        res.status(200).json({
            success: true,
            backups: backupsWithDetails
        });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al listar los backups',
            error: error.message
        });
    }
}

const restoreBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(backupDir, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                mensaje: 'Backup no encontrado'
            });
        }
        
        // Fix the path with proper backslashes
        const mysqlPath = 'C:\\wamp64\\bin\\mysql\\mysql9.1.0\\bin\\mysql.exe';
        
        // Important: When using -p with a password, there should be NO space between -p and the password
        const command = `"${mysqlPath}" -h ${dbHost} -u ${dbUser} ${dbPass ? `-p${dbPass}` : ''} ${dbName} < "${filePath}"`;
        
        // Execute with a longer timeout
        const { stdout, stderr } = await execPromise(command, { timeout: 60000 });

        await backupModel.logRestore(filename, req.usuario && req.usuario.userId ? req.usuario.userId : null);

        res.status(200).json({
            success: true,
            mensaje: 'Base de datos restaurada exitosamente'
        });
    } catch (error) {
        console.error('Error restoring backup:', error);
        
        // Check for specific error conditions
        if (error.message && error.message.includes('no se reconoce como un comando interno o externo')) {
            return res.status(500).json({
                success: false,
                mensaje: 'Error al restaurar el backup: mysql no encontrado',
                error: 'Asegúrate de que MySQL está instalado y la ruta es correcta'
            });
        }
        
        // Check for timeout
        if (error.killed && error.signal === 'SIGTERM') {
            return res.status(500).json({
                success: false,
                mensaje: 'Error al restaurar el backup: el proceso ha tardado demasiado tiempo',
                error: 'Intenta de nuevo o contacta al administrador del sistema'
            });
        }
        
        res.status(500).json({
            success: false,
            mensaje: 'Error al restaurar el backup',
            error: error.message
        });
    }
}

const downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(backupDir, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                mensaje: 'Backup no encontrado'
            });
        }
        res.download(filePath, filename);
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al descargar el backup',
            error: error.message
        });
    }
}

const deleteBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(backupDir, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                mensaje: 'Backup no encontrado'
            });
        }
        fs.unlinkSync(filePath);
        await backupModel.deleteBackupRecord(filename);
        res.status(200).json({
            success: true,
            mensaje: 'Backup eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el backup',
            error: error.message
        });
    }
}

const getBackupStats = async (req, res) => {
    try {
        const stats = await backupModel.getBackupStats();
        const monthlyStats = await backupModel.getBackupsByMonth();
        res.status(200).json({
            success: true,
            stats,
            monthlyStats
        });
    } catch (error) {
        console.error('Error getting backup stats:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener las estadísticas de los backups',
            error: error.message
        });
    }
}

module.exports = {
    createBackup,
    getBackups,
    restoreBackup,
    downloadBackup,
    deleteBackup,
    getBackupStats
}
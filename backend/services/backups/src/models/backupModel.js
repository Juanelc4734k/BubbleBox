const db = require('../config/db');

const createBackup = (filename, userId) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO backups (filename, created_at, created_by) VALUES (?, NOW(), ?)";
        db.query(query, [filename, userId], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const getBackups = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT b.id, b.filename, b.created_at, u.nombre as created_by_name, u.id as created_by_id
            FROM backups b
            LEFT JOIN usuarios u ON b.created_by = u.id
            ORDER BY b.created_at DESC
        `;
        db.query(query, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
};

const logRestore = (filename, userId) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO backup_restores (backup_filename, restored_at, restored_by) VALUES (?, NOW(), ?)";
        db.query(query, [filename, userId], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const deleteBackupRecord = (filename) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM backups WHERE filename = ?";
        db.query(query, [filename], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const getBackupStats = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                COUNT(*) as total_backups,
                DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:%i:%s') as last_backup_date,
                (SELECT COUNT(*) FROM backup_restores) as total_restores,
                (SELECT DATE_FORMAT(MAX(restored_at), '%Y-%m-%d %H:%i:%s') FROM backup_restores) as last_restore_date
            FROM backups
        `;
        db.query(query, (err, results) => {
            if(err) return reject(err);
            resolve(results[0]);
        });
    });
};

const getBackupsByMonth = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM backups
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `;
        db.query(query, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    createBackup,
    getBackups,
    logRestore,
    deleteBackupRecord,
    getBackupStats,
    getBackupsByMonth
};
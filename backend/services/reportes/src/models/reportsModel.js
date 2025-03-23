const db = require('../config/db');

const createReport = (tipo_reporte, id_contenido, id_usuario_reportante, motivo, descripcion) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO reportes (
                tipo_reporte,
                id_contenido,
                id_usuario_reportante,
                motivo,
                descripcion,
                estado,
                fecha_reporte
            ) VALUES (?, ?, ?, ?, ?, 'pendiente', NOW())
        `;
        
        db.queryCallback(
            query,
            [tipo_reporte, id_contenido, id_usuario_reportante, motivo, descripcion],
            (err, result) => {
                if(err) return reject(err);
                resolve(result);
            }
        );
    });
};

const getReports = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM reportes';
        db.queryCallback(query, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
};

const getReportById = (reportId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM reportes WHERE id = ?';
        db.queryCallback(query, [reportId], (err, results) => {
            if(err) return reject(err);
            resolve(results[0]);
        });
    });
};

const updateReportStatus = (reportId, newStatus) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE reportes SET estado = ? WHERE id = ?';
        db.queryCallback(query, [newStatus, reportId], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const deleteReport = (reportId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM reportes WHERE id = ?';
        db.queryCallback(query, [reportId], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Add these new functions:

// Get reports with filters, pagination, and sorting
const getFilteredReports = (filters = {}, limit = 10, offset = 0) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM reportes WHERE 1=1';
        const params = [];
        
        // Add filters
        if (filters.tipo && filters.tipo !== '') {
            query += ' AND tipo_reporte = ?';
            params.push(filters.tipo);
        }
        
        if (filters.estado && filters.estado !== '') {
            query += ' AND estado = ?';
            params.push(filters.estado);
        }
        
        // Add sorting
        query += ' ORDER BY fecha_reporte DESC';
        
        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        db.queryCallback(query, params, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
};

// Count total reports with filters
const countReports = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT COUNT(*) as count FROM reportes WHERE 1=1';
        const params = [];
        
        // Add filters
        if (filters.tipo && filters.tipo !== '') {
            query += ' AND tipo_reporte = ?';
            params.push(filters.tipo);
        }
        
        if (filters.estado && filters.estado !== '') {
            query += ' AND estado = ?';
            params.push(filters.estado);
        }
        
        db.queryCallback(query, params, (err, results) => {
            if(err) return reject(err);
            resolve(results[0]);
        });
    });
};

// Get report statistics
const getReportStats = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN estado = 'revisado' THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rejected
            FROM reportes
        `;
        
        db.queryCallback(query, (err, results) => {
            if(err) return reject(err);
            resolve(results[0]);
        });
    });
};

// Resolve or update a report
const resolveReport = (reportId, data) => {
    return new Promise((resolve, reject) => {
        // Check if the table has the necessary columns
        db.queryCallback('SHOW COLUMNS FROM reportes LIKE "id_admin"', (err, columns) => {
            let query;
            let params;
            
            // If id_admin column exists
            if (columns && columns.length > 0) {
                query = `
                    UPDATE reportes 
                    SET 
                        estado = ?,
                        accion_tomada = ?,
                        id_admin = ?,
                        fecha_resolucion = NOW()
                    WHERE id = ?
                `;
                params = [data.estado, data.accion_tomada, data.id_admin, reportId];
            } else {
                // Fallback query without id_admin and fecha_resolucion
                query = `
                    UPDATE reportes 
                    SET 
                        estado = ?,
                        accion_tomada = ?
                    WHERE id = ?
                `;
                params = [data.estado, data.accion_tomada, reportId];
            }
            
            db.queryCallback(query, params, (err, result) => {
                if(err) return reject(err);
                resolve(result);
            });
        });
    });
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReportStatus,
    deleteReport,
    // Add these new exports:
    getFilteredReports,
    countReports,
    getReportStats,
    resolveReport
};

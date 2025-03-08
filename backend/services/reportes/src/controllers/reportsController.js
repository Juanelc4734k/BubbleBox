const reportsModel = require('../models/reportsModel');

const createReport = async (req, res) => {
    try {
        const { tipo_reporte, id_contenido, id_usuario_reportante, motivo, descripcion } = req.body;
        
        // Validate required fields
        if (!tipo_reporte || !id_contenido || !id_usuario_reportante || !motivo) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos' 
            });
        }
        
        const result = await reportsModel.createReport(
            tipo_reporte, 
            id_contenido, 
            id_usuario_reportante, 
            motivo, 
            descripcion || ''
        );
        
        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el reporte', 
            error: error.message 
        });
    }
};

const getReports = async (req, res) => {
    try {
        const { tipo, estado, limit = 10, offset = 0 } = req.query;
        const filters = { tipo, estado };
        
        const reports = await reportsModel.getFilteredReports(filters, limit, offset);
        
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener los reportes', 
            error: error.message 
        });
    }
};

const getReportById = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await reportsModel.getReportById(reportId);
        
        if (!report) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reporte no encontrado' 
            });
        }
        
        res.status(200).json(report);
    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener el reporte', 
            error: error.message 
        });
    }
};

const countReports = async (req, res) => {
    try {
        const { tipo, estado } = req.query;
        const filters = { tipo, estado };
        
        const result = await reportsModel.countReports(filters);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al contar reportes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al contar los reportes', 
            error: error.message 
        });
    }
};

const getReportStats = async (req, res) => {
    try {
        const stats = await reportsModel.getReportStats();

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas de reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas de reportes',
            error: error.message
        });
    }
};

const resolveReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { id_admin, estado, accion_tomada } = req.body;
        
        // Validate required fields
        if (!id_admin || !estado) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos' 
            });
        }
        
        // Validate status value
        const validStatuses = ['pendiente', 'revisado', 'resuelto', 'rechazado'];
        if (!validStatuses.includes(estado)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Estado no válido' 
            });
        }
        
        await reportsModel.resolveReport(reportId, {
            id_admin,
            estado,
            accion_tomada: accion_tomada || ''
        });
        
        res.status(200).json({
            success: true,
            message: 'Reporte actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al resolver reporte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al resolver el reporte', 
            error: error.message 
        });
    }
};

const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        
        await reportsModel.deleteReport(reportId);
        
        res.status(200).json({
            success: true,
            message: 'Reporte eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar el reporte', 
            error: error.message 
        });
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    countReports,
    getReportStats,
    resolveReport,
    deleteReport
};
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// Helper function to format dates
const formatDate = (date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
};

// Generate PDF for users dashboard
exports.generateUsersPDF = async (req, res) => {
    try {
        const { userData, monthlyData } = req.body;
        
        // Create a document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=usuarios_${Date.now()}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add content to the PDF
        addHeader(doc, 'Reporte de Usuarios');
        addDateInfo(doc);
        
        // Add statistics
        doc.fontSize(14).text('Estadísticas Generales', { underline: true });
        doc.moveDown();
        
        if (userData) {
            doc.fontSize(12).text(`Usuarios Totales: ${userData.totalUsers || 0}`);
            doc.text(`Usuarios Conectados: ${userData.connectedUsers || 0}`);
            doc.text(`Usuarios Nuevos: ${userData.newUsers || 0}`);
            doc.text(`Usuarios Activos: ${userData.activeUsers || 0}`);
            doc.moveDown();
        } else {
            doc.text('No hay datos de usuarios disponibles');
            doc.moveDown();
        }
        
        // Add monthly data
        doc.fontSize(14).text('Tendencia Mensual', { underline: true });
        doc.moveDown();
        
        if (monthlyData && monthlyData.length > 0) {
            // Create a simple table for monthly data
            const tableTop = doc.y;
            const tableLeft = 50;
            
            // Table headers
            doc.fontSize(12).text('Mes', tableLeft, tableTop);
            doc.text('Usuarios', tableLeft + 150, tableTop);
            doc.text('Crecimiento', tableLeft + 250, tableTop);
            
            doc.moveDown();
            let rowTop = doc.y;
            
            // Table rows
            monthlyData.forEach((data, i) => {
                doc.fontSize(10).text(data.month, tableLeft, rowTop);
                doc.text(data.count.toString(), tableLeft + 150, rowTop);
                doc.text(`${data.growth >= 0 ? '+' : ''}${data.growth.toFixed(1)}%`, tableLeft + 250, rowTop);
                rowTop += 20;
            });
        } else {
            doc.text('No hay datos mensuales disponibles');
        }
        
        // Add footer
        addFooter(doc);
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating users PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
};

// Generate PDF for publications dashboard
exports.generatePublicationsPDF = async (req, res) => {
    try {
        const { publicationsData, monthlyData } = req.body;
        
        // Create a document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=publicaciones_${Date.now()}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add content to the PDF
        addHeader(doc, 'Reporte de Publicaciones');
        addDateInfo(doc);
        
        // Add statistics
        doc.fontSize(14).text('Estadísticas Generales', { underline: true });
        doc.moveDown();
        
        if (publicationsData) {
            doc.fontSize(12).text(`Publicaciones Totales: ${publicationsData.totalPublicaciones || 0}`);
            doc.text(`Publicaciones Hoy: ${publicationsData.todayPublicaciones || 0}`);
            doc.text(`Usuarios Publicando: ${publicationsData.publishersCount || 0}`);
            doc.text(`Publicaciones Destacadas: ${publicationsData.featuredCount || 0}`);
            doc.moveDown();
        } else {
            doc.text('No hay datos de publicaciones disponibles');
            doc.moveDown();
        }
        
        // Add monthly data
        doc.fontSize(14).text('Tendencia Mensual', { underline: true });
        doc.moveDown();
        
        if (monthlyData && monthlyData.length > 0) {
            // Create a simple table for monthly data
            const tableTop = doc.y;
            const tableLeft = 50;
            
            // Table headers
            doc.fontSize(12).text('Mes', tableLeft, tableTop);
            doc.text('Publicaciones', tableLeft + 150, tableTop);
            doc.text('Crecimiento', tableLeft + 250, tableTop);
            
            doc.moveDown();
            let rowTop = doc.y;
            
            // Table rows
            monthlyData.forEach((data, i) => {
                doc.fontSize(10).text(data.month, tableLeft, rowTop);
                doc.text(data.count.toString(), tableLeft + 150, rowTop);
                doc.text(`${data.growth >= 0 ? '+' : ''}${data.growth.toFixed(1)}%`, tableLeft + 250, rowTop);
                rowTop += 20;
            });
        } else {
            doc.text('No hay datos mensuales disponibles');
        }
        
        // Add footer
        addFooter(doc);
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating publications PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
};

// Generate PDF for reels dashboard
exports.generateReelsPDF = async (req, res) => {
    try {
        const { reelsData, monthlyData } = req.body;
        
        // Create a document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reels_${Date.now()}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add content to the PDF
        addHeader(doc, 'Reporte de Reels');
        addDateInfo(doc);
        
        // Add statistics
        doc.fontSize(14).text('Estadísticas Generales', { underline: true });
        doc.moveDown();
        
        if (reelsData) {
            doc.fontSize(12).text(`Reels Totales: ${reelsData.totalReels || 0}`);
            doc.text(`Reels Hoy: ${reelsData.todayReels || 0}`);
            doc.text(`Usuarios con Reels: ${reelsData.reelsCreators || 0}`);
            doc.text(`Reels Destacados: ${reelsData.featuredReels || 0}`);
            doc.moveDown();
        } else {
            doc.text('No hay datos de reels disponibles');
            doc.moveDown();
        }
        
        // Add monthly data
        doc.fontSize(14).text('Tendencia Mensual', { underline: true });
        doc.moveDown();
        
        if (monthlyData && monthlyData.length > 0) {
            // Create a simple table for monthly data
            const tableTop = doc.y;
            const tableLeft = 50;
            
            // Table headers
            doc.fontSize(12).text('Mes', tableLeft, tableTop);
            doc.text('Reels', tableLeft + 150, tableTop);
            doc.text('Crecimiento', tableLeft + 250, tableTop);
            
            doc.moveDown();
            let rowTop = doc.y;
            
            // Table rows
            monthlyData.forEach((data, i) => {
                doc.fontSize(10).text(data.month, tableLeft, rowTop);
                doc.text(data.count.toString(), tableLeft + 150, rowTop);
                doc.text(`${data.growth >= 0 ? '+' : ''}${data.growth.toFixed(1)}%`, tableLeft + 250, rowTop);
                rowTop += 20;
            });
        } else {
            doc.text('No hay datos mensuales disponibles');
        }
        
        // Add footer
        addFooter(doc);
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating reels PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
};

// Generate PDF for reports dashboard
exports.generateReportsPDF = async (req, res) => {
    try {
        const { reportsData, reportsList } = req.body;
        
        // Create a document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reportes_${Date.now()}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add content to the PDF
        addHeader(doc, 'Reporte de Denuncias');
        addDateInfo(doc);
        
        // Add statistics
        doc.fontSize(14).text('Estadísticas Generales', { underline: true });
        doc.moveDown();
        
        if (reportsData) {
            doc.fontSize(12).text(`Denuncias Totales: ${reportsData.totalReports || 0}`);
            doc.text(`Denuncias Pendientes: ${reportsData.pendingReports || 0}`);
            doc.text(`Denuncias Resueltas: ${reportsData.resolvedReports || 0}`);
            doc.moveDown();
        } else {
            doc.text('No hay datos de denuncias disponibles');
            doc.moveDown();
        }
        
        // Add reports list
        doc.fontSize(14).text('Denuncias Recientes', { underline: true });
        doc.moveDown();
        
        if (reportsList && reportsList.length > 0) {
            // Create a simple table for reports
            const tableTop = doc.y;
            const tableLeft = 50;
            
            // Table headers
            doc.fontSize(12).text('Usuario', tableLeft, tableTop);
            doc.text('Tipo', tableLeft + 100, tableTop);
            doc.text('Motivo', tableLeft + 180, tableTop);
            doc.text('Estado', tableLeft + 300, tableTop);
            doc.text('Fecha', tableLeft + 380, tableTop);
            
            doc.moveDown();
            let rowTop = doc.y;
            
            // Table rows (limit to 10 reports to avoid too long PDF)
            const limitedReports = reportsList.slice(0, 10);
            limitedReports.forEach((report, i) => {
                doc.fontSize(10).text(report.username || 'Desconocido', tableLeft, rowTop);
                doc.text(report.type || '-', tableLeft + 100, rowTop);
                
                // Truncate reason if too long
                const reason = report.reason || '-';
                doc.text(reason.length > 15 ? reason.substring(0, 15) + '...' : reason, tableLeft + 180, rowTop);
                
                doc.text(report.status || 'Pendiente', tableLeft + 300, rowTop);
                doc.text(report.date ? formatDate(report.date) : '-', tableLeft + 380, rowTop);
                rowTop += 20;
                
                // Add a page break if needed
                if (rowTop > doc.page.height - 100) {
                    doc.addPage();
                    rowTop = 50;
                }
            });
            
            if (reportsList.length > 10) {
                doc.moveDown();
                doc.text(`... y ${reportsList.length - 10} denuncias más`);
            }
        } else {
            doc.text('No hay denuncias recientes disponibles');
        }
        
        // Add footer
        addFooter(doc);
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating reports PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
};

// Helper functions for PDF generation
function addHeader(doc, title) {
    // Add logo (if available)
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });
    
    // Add title
    doc.fontSize(20)
       .text('BubbleBox Dashboard', { align: 'center' })
       .fontSize(16)
       .text(title, { align: 'center' })
       .moveDown();
}

function addDateInfo(doc) {
    const currentDate = new Date();
    doc.fontSize(10)
       .text(`Generado el: ${formatDate(currentDate)}`, { align: 'right' })
       .moveDown(2);
}

function addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Save the current position
        const originalY = doc.y;
        
        // Go to the bottom of the page
        doc.fontSize(10)
           .text(
               'BubbleBox - Reporte generado automáticamente',
               50,
               doc.page.height - 50,
               { align: 'center' }
           );
        
        // Add page number
        doc.text(
            `Página ${i + 1} de ${pageCount}`,
            50,
            doc.page.height - 35,
            { align: 'center' }
        );
        
        // Restore the position
        doc.y = originalY;
    }
}
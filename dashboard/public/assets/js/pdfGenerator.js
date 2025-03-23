/**
 * PDF Generator Utility
 * Handles PDF generation requests for different dashboard pages
 */

const pdfGenerator = {
    // Base URL for the stats service PDF endpoints
    baseUrl: 'http://localhost:3013/stats/pdf',

    /**
     * Generate a PDF for the users dashboard
     * @param {Object} userData - User statistics data
     * @param {Array} monthlyData - Monthly user data for charts
     */
    generateUsersPDF: async function(userData, monthlyData) {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userData, monthlyData })
            });

            if (!response.ok) {
                throw new Error('Error generating PDF');
            }

            // Create a blob from the PDF stream
            const blob = await response.blob();
            
            // Create a link to download the PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `usuarios_${new Date().getTime()}.pdf`;
            
            // Append to the document and trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Error generating users PDF:', error);
            alert('Error al generar el PDF de usuarios');
            return false;
        }
    },

    /**
     * Generate a PDF for the publications dashboard
     * @param {Object} publicationsData - Publication statistics data
     * @param {Array} monthlyData - Monthly publication data for charts
     */
    generatePublicationsPDF: async function(publicationsData, monthlyData) {
        try {
            const response = await fetch(`${this.baseUrl}/publications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ publicationsData, monthlyData })
            });

            if (!response.ok) {
                throw new Error('Error generating PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `publicaciones_${new Date().getTime()}.pdf`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Error generating publications PDF:', error);
            alert('Error al generar el PDF de publicaciones');
            return false;
        }
    },

    /**
     * Generate a PDF for the reels dashboard
     * @param {Object} reelsData - Reels statistics data
     * @param {Array} monthlyData - Monthly reels data for charts
     */
    generateReelsPDF: async function(reelsData, monthlyData) {
        try {
            const response = await fetch(`${this.baseUrl}/reels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reelsData, monthlyData })
            });

            if (!response.ok) {
                throw new Error('Error generating PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `reels_${new Date().getTime()}.pdf`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Error generating reels PDF:', error);
            alert('Error al generar el PDF de reels');
            return false;
        }
    },

    /**
     * Generate a PDF for the reports dashboard
     * @param {Object} reportsData - Reports statistics data
     * @param {Array} reportsList - List of recent reports
     */
    generateReportsPDF: async function(reportsData, reportsList) {
        try {
            const response = await fetch(`${this.baseUrl}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reportsData, reportsList })
            });

            if (!response.ok) {
                throw new Error('Error generating PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `reportes_${new Date().getTime()}.pdf`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Error generating reports PDF:', error);
            alert('Error al generar el PDF de reportes');
            return false;
        }
    }
};
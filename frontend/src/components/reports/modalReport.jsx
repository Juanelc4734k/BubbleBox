import { useState } from 'react';
import { FiFlag } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '../../assets/css/reports/modalReport.css'
import { IoClose } from 'react-icons/io5';

const ModalReport = ({ isOpen, onClose, contentId, contentType, reportedUserId, isModalReport, setIsModalReport }) => {
    const [reportData, setReportData] = useState({
        motivo: '',
        descripcion: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reportData.motivo) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, selecciona un motivo para el reporte',
                confirmButtonColor: '#b685e4'
            });
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch('http://localhost:3015/reports/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo_reporte: contentType,
                    id_contenido: contentId,
                    id_usuario_reportante: userId,
                    motivo: reportData.motivo,
                    descripcion: reportData.descripcion || null
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Reporte enviado!',
                    text: 'Gracias por ayudarnos a mantener la comunidad segura',
                    confirmButtonColor: '#b685e4'
                });
                onClose();
            } else {
                throw new Error('Error al enviar el reporte');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al enviar el reporte. Por favor, inténtalo de nuevo.',
                confirmButtonColor: '#b685e4'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex items-center justify-center modalReport">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl text-purple-400 font-semibold flex items-center gap-2">
                        <FiFlag className="text-purple-500" />
                        Reportar contenido
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <IoClose className="text-2xl rounded-full" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Motivo del reporte *
                        </label>
                        <select
                            name="motivo"
                            value={reportData.motivo}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-purple-500"
                            required
                        >
                            <option value="">Selecciona un motivo</option>
                            <option value="contenido_inapropiado">Contenido inapropiado</option>
                            <option value="spam">Spam</option>
                            <option value="acoso">Acoso</option>
                            <option value="violencia">Violencia</option>
                            <option value="desinformacion">Desinformación</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            name="descripcion"
                            value={reportData.descripcion}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-purple-500"
                            rows="4"
                            placeholder="Proporciona más detalles sobre el reporte..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                            Enviar reporte
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalReport;
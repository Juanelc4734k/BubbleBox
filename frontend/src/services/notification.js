import axios from "axios";

const API_URL = 'http://localhost:3000/notifications';

export const getNotification = async () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('userId'); // Asegúrate de guardar esto al hacer login

    if (!usuarioId) {
        console.error("No se encontró usuarioId en localStorage");
        return [];
    }

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.get(`${API_URL}/usuario/${usuarioId}`, config);
        console.table(response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return [];
    }
};

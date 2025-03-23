import axios from "axios";

const API_URL = 'https://bubblebox-ydre.onrender.com/notifications';

export const getNotification = async () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('userId');

    if (!usuarioId) {
        console.error("No se encontró usuarioId en localStorage");
        return [];
    }

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.get(`${API_URL}/usuario/${usuarioId}`, config);
        // Transform the response to ensure referencia_id is included
        const notifications = response.data.map(notification => ({
            ...notification,
            referencia_id: notification.referencia_id || null
        }));
        return notifications;
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return [];
    }
};

export const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.put(`${API_URL}/marcar-leida/${notificationId}`, {}, config);
        return response.data;
    } catch (error) {
        console.error("Error al marcar la notificación como leída:", error);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.delete(`${API_URL}/eliminar/${notificationId}`, config);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la notificación:", error);
        throw error;
    }
};
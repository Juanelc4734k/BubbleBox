import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getFriends = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/amistades/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener amigos:', error);
        throw error;
    }
};

export const getFriendRequests = async (userData) => {
    try {
        const response = await axios.get(`${API_URL}/friendships/solicitudes-pendientes/${userData}`);
        console.log('Respuesta: ', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al obtener las solicitudes de amistad: ', error);
        throw error;
    }
};

export const sendFriendRequest = async (userData) => {
    const response = await axios.post(`${API_URL}/friendships/solicitar`, userData);
    console.log('Respuesta: ', response.data);
    return response.data;
};

export const acceptFriendRequest = async (friendshipId) => {
    try {
        const token = localStorage.getItem('token');
        if (!friendshipId) {
            throw new Error('FriendshipId is required');
        }
        
        const response = await axios.put(`${API_URL}/friendships/aceptar/${friendshipId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data.success) {
            throw new Error(response.data.mensaje || 'Error accepting friend request');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

export const rejectFriendRequest = async (friendshipId) => {
    try {
        const token = localStorage.getItem('token');
        if (!friendshipId) {
            throw new Error('FriendshipId is required');
        }

        const response = await axios.put(`${API_URL}/friendships/rechazar/${friendshipId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data || response.data.affectedRows === 0) {
            throw new Error('Failed to reject friend request');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw error;
    }
};

export const getRequestEarring = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/solicitudes-pendientes/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad pendientes:', error);
        throw error;
    }
};

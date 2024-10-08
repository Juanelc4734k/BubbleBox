import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getFriends = async (userData) => {
    const response = await axios.get(`${API_URL}/friendships/amistades/${userData}`);
    console.log('Respuesta: ', response.data);
    return response.data;
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
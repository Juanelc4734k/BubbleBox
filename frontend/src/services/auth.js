import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const login = async (userData) => {
    try {
        console.log('Enviando solicitud de login a:', `${API_URL}/auth/login`);
        console.log('Credenciales:', userData);
        const response = await axios.post(`${API_URL}/auth/login`, userData);
        console.log('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error en la función login:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
            console.error('Estado HTTP:', error.response.status);
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor');
        } else {
            console.error('Error al configurar la solicitud:', error.message);
        }
        throw error;
    }
};

export const recoverPassword = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/recover-password`, userData);
    console.table(response.data);
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(`http://localhost:3000/auth/restablecer-contrasena/${token}`, {
            nuevaContrasena: newPassword
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const verificarRol = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token');
        }
        const response = await fetch(`${API_URL}/auth/verify-role`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Error al verificar el rol: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en verificarRol:', error);
        throw error;
    }
};

export const logoutUser = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/auth/logout`, { userId }, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data;
        
    } catch (error) {
        console.log('Error en logoutUser: ', error);
        throw error;
    }
}

export const updateLastSeen = async (userId, status = 'desconectado', lastSeen = new Date().toISOString()) => {
    try {
        const response = await axios.put(`http://localhost:3001/chats/update-last-seen/${userId}`, {
            status,
            lastSeen
        });
        console.log('Last seen updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating last seen:', error);
        throw error;
    }
}
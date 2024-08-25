import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, userData);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Error en el servidor');
        } else if (error.request) {
            throw new Error('No se pudo conectar con el servidor');
        } else {
            throw new Error('Error al procesar la solicitud');
        }
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
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};



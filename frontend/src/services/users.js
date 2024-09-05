import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users/usuarios`);
    console.log('Respuesta: ', response.data);
    return response.data;
};

// Obtener perfil de usuario privado
export const getProfiles = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.get(`${API_URL}/users/perfil`, config);
    console.table(response.data);
    return response.data;
};

// Actualizar perfil de usuario privado
export const updateProfile = async (profile) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.put(`${API_URL}/users/perfil`, profile, config);
    return response.data;
};

// Obtener perfil de usuario público
export const getUserProfile = async (userId) => {
    const response = await axios.get(`${API_URL}/users/perfil/${userId}`);
    return response.data;
};
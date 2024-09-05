import axios from 'axios'

const API_URL = 'http://localhost:3000';

export const getUserById = async (id) => {
    const response = await axios.get(`${API_URL}/users/usuario/${id}`);
    return response.data;
};


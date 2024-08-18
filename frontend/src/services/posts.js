import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getAllPosts = async () => {
    try {
        const response = await axios.get(`${API_URL}/posts/obtener-todos`);
        console.log('Datos obtenidos:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        if (error.response) {
            console.error('Server responded with:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
};

export const createPost = async (postData) => {
    const response = await axios.post(`${API_URL}/posts/crear`, postData);
    return response.data;
};

export const updatePost = async (postId, postData) => {
    const response = await axios.put(`${API_URL}/posts/actualizar/${postId}`, postData);
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await axios.delete(`${API_URL}/posts/eliminar/${postId}`);
    return response.data;
};
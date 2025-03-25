import axios from 'axios';

const API_URL = 'http://localhost:3002/reels';

export const getAllReels = async () => {
  try {
    const response = await axios.get(`${API_URL}/todosReels`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reels:', error);
    throw error;
  }
}

export const createReel = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/crearReel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
}

export const deleteReel = async (IdReel) => {
  try {
    const response = await axios.delete(`${API_URL}/eliminarReel/${IdReel}`);
    return response.data;
  } catch (error) {
    console.error('Error delete reel', error);
    throw error;
  }
}
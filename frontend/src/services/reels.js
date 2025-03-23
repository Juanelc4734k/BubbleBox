import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000/reels';

export const getAllReels = async () => {
  try {
    const response = await axios.get(`${API_URL}/todosReels`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reels:', error);
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
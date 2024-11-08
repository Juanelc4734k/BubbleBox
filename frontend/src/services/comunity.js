import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getCommunities = async () => {
    const response = await axios.get(`${API_URL}/communities/obtener-todas`);
    return response.data;
};


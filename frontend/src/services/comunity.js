import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getCommunities = async () => {
    const response = await axios.get(`${API_URL}/communities/obtener-todas`);
    return response.data;
};

export const getCommunityById = async (id) => {
    const response = await axios.get(`${API_URL}/communities/obtener/${id}`);
    return response.data;
}

export const createCommunity = async (community) => {
    const response = await axios.post(`${API_URL}/communities/crear`, community);
    return response.data;
}

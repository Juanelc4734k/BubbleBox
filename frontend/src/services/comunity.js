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


export const getCommunityByPostId = async (idComunidad) => {

    const response = await axios.get(`${API_URL}/posts/comunidad/${idComunidad}`);
    return response.data;
}

export const getCommunityMembers = async (idComunidad) =>{

    const response = await axios.get(`${API_URL}/communities/obtener-miembros/${idComunidad}`);
    return response.data;
}

export const createCommunity = async (comunityData) => {
    const response = await axios.post(`${API_URL}/communities/crear`, comunityData);
    return response.data;
}

export const updateCommunity = async (communityId, comunityData) => {
    // Check if comunityData is FormData
    const headers = comunityData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' } 
        : { 'Content-Type': 'application/json' };
    
    const response = await axios.put(
        `${API_URL}/communities/actualizar/${communityId}`, 
        comunityData,
        { headers }
    );
    return response.data;
}

export const deleteCommunity = async (communityId) => {
    const response = await axios.delete(`${API_URL}/communities/eliminar/${communityId}`);
    return response.data;
}

export const joinCommunity = async (communityId, idUsuario) => {
    const response = await axios.post(`${API_URL}/communities/unirse/${communityId}`, {
        idUsuario: idUsuario
    });
    return response.data;
};

export const leaveCommunity = async (communityId, idUsuario) => {
    const response = await axios.post(`${API_URL}/communities/salir/${communityId}`, {
        idUsuario: idUsuario
    });
    return response.data;
};

export const isMember = async (communityId, idUsuario) => {
    const response = await axios.get(`${API_URL}/communities/esMiembro/${communityId}/${idUsuario}`, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data.esMiembro;
};
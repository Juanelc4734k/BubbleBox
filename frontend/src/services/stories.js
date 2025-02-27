import axios from "axios";

const API_URL = 'http://127.0.0.1:3000/stories';

const getStoriesFriends = (id) => {
    return axios.get(`${API_URL}/amigos/${id}`);
};

const getStoriesByUser = (userId) => {
    return axios.get(`${API_URL}/usuario/${userId}`);
};

const createStorieText = (userId, content) => {
    return axios.post(`${API_URL}/crear`, {
        usuario_id: userId,
        contenido: content,
        tipo: 'texto'
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

const createStorieMulti = (userId, file) => {
    const formData = new FormData();
    formData.append('usuario_id', userId);
    formData.append('tipo', file.type.startsWith('video/') ? 'video' : 'imagen');
    formData.append('storiesContent', file);

    return axios.post(`${API_URL}/crear`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const registerVista = (storieId) => {
    return axios.post(`${API_URL}/${storieId}/vista`);
};

const getVista = (storieId) => {
    return axios.get(`${API_URL}/${storieId}/vistas`);
};

export {
    getStoriesFriends,
    getStoriesByUser,
    createStorieText,
    createStorieMulti,
    registerVista,
    getVista
};

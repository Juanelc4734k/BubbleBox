import axios from 'axios'

const API_URL = 'https://bubblebox-ydre.onrender.com/reactions'

//Reacciones publicaciones
export const getReactionsPosts = async (id) => {
    const response = await axios.get(`${API_URL}/reacciones-publicacion/${id}`)
    return response.data
}

export const createReactionPost = async (reactionData) => {
    const response = await axios.post(`${API_URL}/crear-reaccion`, reactionData)
    return response.data
}

//Reacciones Reels
export const getReactionsReels = async (id) => {
    const response = await axios.get(`${API_URL}/reacciones-reel/${id}`)
    return response.data
}

export const createReactionReel = async (reactionData) => {
    const response = await axios.post(`${API_URL}/crear-reaccion`, reactionData)
    return response.data
}


//Eliminar reacción
export const deleteReaction = async (reaccionData) => {
    const response = await axios.delete(`${API_URL}/eliminar-reaccion`, {
        data: reaccionData
    });
    return response.data;
}
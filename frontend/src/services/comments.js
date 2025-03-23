import axios from 'axios'

const API_URL = 'https://bubblebox-ydre.onrender.com/comments';

export const getCommentsByPost = async (idPost) => {
    try {
        const response = await axios.get(`${API_URL}/publicaciones/${idPost}/comentarios`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

export const getCommentsByReel = async (idReel) => {
    try {
        const response = await axios.get(`${API_URL}/reels/${idReel}/comentarios`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}


export const createCommentPost = async (data) => {
    try {
        const requestBody = {
            idUsuario: data.idUsuario,
            contenido: data.contenido
        };
        const response = await axios.post(
            `${API_URL}/publicaciones/${data.idPost}/comentarios`, 
            requestBody
        );
        return response.data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
} 

export const createCommentReel = async (data) => {
    try {
        const requestBody = {
            idUsuario: data.idUsuario,
            contenido: data.contenido
        };
        const response = await axios.post(
            `${API_URL}/reels/${data.idReel}/comentarios`, 
            requestBody
        );
        return response.data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
} 

export const getCommentRepliesByPost = async (commentId) => {
    try {
      const response = await axios.get(`${API_URL}/publicaciones/comentarios/${commentId}/respuestas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      throw error;
    }
  };
  
  export const createCommentReplyPost = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/publicaciones/comentarios/${data.idComentario}/respuestas`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating comment reply:', error);
      throw error;
    }
  };
  
  export const getCommentRepliesByReel = async (commentId) => {
    try {
      const response = await axios.get(`${API_URL}/reels/comentarios/${commentId}/respuestas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      throw error;
    }
  };
  
  export const createCommentReplyReel = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/reels/comentarios/${data.idComentario}/respuestas`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating comment reply:', error);
      throw error;
    }
  };
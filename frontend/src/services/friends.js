import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getFriends = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/amistades/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener amigos:', error);
        throw error;
    }
};

export const getFriendsBlocked = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/amistades-bloqueadas/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener amigos bloqueados:', error);
        throw error;
    }
};

export const desbloquearUsuario = async (idUsuarioDesbloquea, idUsuarioDesbloqueado) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/friendships/desbloquear`, {
            id_usuario1: idUsuarioDesbloquea,
            id_usuario2: idUsuarioDesbloqueado
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al desbloquear usuario:', error);
        throw error;
    }
};

export const getFriendRequests = async (userData) => {
    try {
        const response = await axios.get(`${API_URL}/friendships/solicitudes-pendientes/${userData}`);
        
        return response.data;
    } catch (error) {
        console.error('Error al obtener las solicitudes de amistad: ', error);
        throw error;
    }
};

export const sendFriendRequest = async (userData) => {
    const response = await axios.post(`${API_URL}/friendships/solicitar`, userData);
    
    return response.data;
};

export const acceptFriendRequest = async (friendshipId) => {
    try {
        const token = localStorage.getItem('token');
        if (!friendshipId) {
            throw new Error('FriendshipId is required');
        }
        
        const response = await axios.put(`${API_URL}/friendships/aceptar/${friendshipId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data.success) {
            throw new Error(response.data.mensaje || 'Error accepting friend request');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

export const rejectFriendRequest = async (friendshipId) => {
    try {
        const token = localStorage.getItem('token');
        if (!friendshipId) {
            throw new Error('FriendshipId is required');
        }

        const response = await axios.put(`${API_URL}/friendships/rechazar/${friendshipId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data || response.data.affectedRows === 0) {
            throw new Error('Failed to reject friend request');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw error;
    }
};

// The removeFriend function is already correct in your file, but let's make sure it's being used properly
export const removeFriend = async (friendshipId) => {
    try {
        const token = localStorage.getItem('token');
        if (!friendshipId) {
            throw new Error('FriendshipId is required');
        }

        const response = await axios.delete(`${API_URL}/friendships/eliminar/${friendshipId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data || response.data.affectedRows === 0) {
            throw new Error('Failed to remove friend');
        }

        return response.data;
    } catch (error) {
        console.error('Error removing friend:', error);
        throw error;
    }
};

export const getRequestEarring = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/solicitudes-pendientes/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener solicitudes de amistad pendientes:', error);
        throw error;
    }
};

export const getFriendsInComun = async (userId, usuario_id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friendships/amigos-comunes/${userId}/${usuario_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting common friends:', error);
        throw error;
    }
};

// Add this function to your existing friends service
export const checkFriendship = async (userId1, userId2) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/friendships/check-friendship/${userId1}/${userId2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.areFriends;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return false;
    }
  };

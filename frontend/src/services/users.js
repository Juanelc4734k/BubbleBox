import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users/usuarios`);
    console.log('Respuesta: ', response.data);
    return response.data;
};

// Obtener perfil de usuario privado
export const getProfiles = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.get(`${API_URL}/users/perfil`, config);
    console.table(response.data);
    return response.data;
};

// Actualizar perfil de usuario privado 
export const updateProfile = async (profile) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.put(`${API_URL}/users/actualizar-usuario/${userId}`, profile, config);
    return response.data;
};

// Obtener perfil de usuario público
export const getUserProfile = async (userId) => {
    const response = await axios.get(`${API_URL}/users/perfil/${userId}`);
    return response.data;
};


export const updatePrivacySettings = async (privacidad) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/actualizar-privacidad`,
        { privacidad },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la configuración de privacidad:', error);
      throw error;
    }
  };

  // Add this function to your users.js service file

export const getUserSettings = async (userId) => {
  try {   
    const response = await axios.get(`${API_URL}/users/configuraciones/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await axios.put(
        `${API_URL}/users/actualizar-configuraciones/${userId}`, 
        settings,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  export const updateUserStatus = async (userId, status) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: status })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado del usuario');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateUserStatus:', error);
        throw error;
    }
};
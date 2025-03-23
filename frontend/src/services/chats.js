import axios from 'axios';

const API_URL = 'https://bubblebox-ydre.onrender.com/chats';
const API_URL2 = 'https://bubblebox-ydre.onrender.com/chats';

export const getChatMessages = async (senderId, receiverId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/messages/${senderId}/${receiverId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (senderId, receiverId, message) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL}/messages`, {
      senderId,
      receiverId,
      message
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const createGroup = async (groupData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL2}/groups`, groupData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const createGroupMessage = async (senderId, groupId, message) => {
  const response = await axios.post(`${API_URL}/groups/${groupId}/messages`, {
    senderId,
    message
  });
  return response.data;
}

export const getGroups = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/groups/user/${userId}`, {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const getGroupMessages = async (groupId) => {
  const token = localStorage.getItem('token');
  const userIdString = localStorage.getItem('userId');
  const userId = Number(userIdString);
  
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/messages/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
};

export const getGroupUsers = async (groupId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/users`, {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group users:', error);
    throw error;
  }
};

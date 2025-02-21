import axios from 'axios';

const API_URL = 'http://localhost:3001/chats';

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

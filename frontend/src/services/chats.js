import axios from 'axios';

const API_URL = 'http://localhost:3000/chats';

export const getChats = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.get(`${API_URL}/messages/:userId1/:userId2`, config);
  return response.data;
};

export const getChatMessages = async (userId1, userId2) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.get(`${API_URL}/messages/${userId1}/${userId2}`, config);
  return response.data;
};

export const sendMessage = async (senderId, receiverId, message) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(`${API_URL}/messages`, { senderId, receiverId, message }, config);
  return response.data;
};

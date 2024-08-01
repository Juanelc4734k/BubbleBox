import axios from 'axios';

//const API_URL = 'http://localhost:3000';

export const register = async (userData) => {
    const response = await axios.post(`http://localhost:3000/auth/register`, userData);
    return response.data;
};

//export const login = async (userData) => {
    //const response = await axios.post(`${API_URL}/auth/login`, userData);
    //return response.data;
//};
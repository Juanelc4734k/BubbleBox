import { io } from "socket.io-client";

//Conectar con el backend 
const socket = io("http://localhost:3007", { transports: ["websocket"]});

// Setup event listeners
socket.on('connect', () => {
    
    
    // Check if notifications are enabled and join the room
    const userId = localStorage.getItem('userId');
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    
    if (userId && notificationsEnabled) {
        socket.emit('join', userId);
    }
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', () => {
    
});

export default socket;
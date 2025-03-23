import { io } from "socket.io-client";

//Conectar con el backend 
const socket = io("https://bubblebox-ydre.onrender.com", { transports: ["websocket"]});

// Setup event listeners
socket.on('connect', () => {
    console.log('Connected to notification server');
    
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
    console.log('Disconnected from notification server');
});

export default socket;
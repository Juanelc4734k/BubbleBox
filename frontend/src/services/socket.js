import { io } from "socket.io-client";

//Conectar con el backend 
const socket = io("http://localhost:3007", { transports: ["websocket"]});

socket.on('connect', () => {
    const userId = localStorage.getItem('userId');
    if(userId){
        socket.emit('join', userId);
    }
});

export default socket;
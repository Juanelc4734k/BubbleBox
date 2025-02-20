import { io } from "socket.io-client";

//Conectar con el backend 
const socket = io("http://localhost:5000", { transports: ["websocket"]});

export default socket;
import React, { useState } from "react";
import Axios from 'axios';

function Login(){
    const [nombre, setUsername] = useState('');
    const [contraseña, setPassword] = useState('');

    const login = () => {
        Axios.post('http://localhost:8081/auth/login', {
            nombre: nombre,
            contraseña: contraseña
        }).then((response) => {
            alert(response.data.message);
            setUsername('');
            setPassword('');
        }).catch((err) => {
            console.error('Error:', err);
            alert('Error al ingresar');
        })
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
        </div>
    );
}

export default Login;
import React, { useState } from "react";

function Login(){
    const [nombre, setUsername] = useState('');
    const [contraseña, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({nombre, contraseña})
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error', error);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
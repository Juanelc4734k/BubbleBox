import React, { useState } from 'react';
import Axios from 'axios';

function Register() {
  const [nombre, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contraseña, setPassword] = useState('');
  
  const reg = () => {
    console.log("Datos enviados:", nombre, email, telefono, contraseña);
    Axios.post("http://localhost:8081/auth/register", {
      nombre: nombre,
      email: email,
      telefono: telefono,
      contraseña: contraseña
    }).then((response) => {
      alert(response.data.message); 
      setUsername('');
      setEmail('');
      setTelefono('');
      setPassword(''); 
    }).catch((err) => {
      alert(err.data.message)
    });
  }
  
  

    return (
      <div>
        <h1>Register</h1>
        <form action=""></form>
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={reg}>Register</button>
      </div>
    );
}

export default Register;

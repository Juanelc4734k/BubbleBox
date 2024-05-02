import React, { useState } from 'react';

function Register() {
  const [nombre, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contraseña, setPassword] = useState('');
  const handleRegister = async () => {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({nombre, email, telefono, contraseña})
      });
      const data = await response.json();
      console.log('Registro exitoso: ', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form action=""></form>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="tel" placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;

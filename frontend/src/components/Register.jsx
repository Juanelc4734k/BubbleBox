import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      console.log(res.data);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        // El servidor respondió con un estado que está fuera del rango de 2xx
        console.error('Error:', err.response.data);
        setError(err.response.data.message || 'Error al registrar');
      } else if (err.request) {
        // La solicitud fue hecha pero no hubo respuesta
        console.error('Error de red');
        setError('Error de red. Por favor, inténtelo de nuevo.');
      } else {
        // Algo sucedió al configurar la solicitud que desencadenó un error
        console.error('Error:', err.message);
        setError('Error inesperado. Por favor, inténtelo de nuevo.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" onChange={handleChange} value={form.username} placeholder="Username" />
      <input type="email" name="email" onChange={handleChange} value={form.email} placeholder='Email'/>
      <input type="password" name="password" onChange={handleChange} value={form.password} placeholder="Password" />
      <select name="role" onChange={handleChange} value={form.role}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
        <option value="employee">Employee</option>
      </select>
      <button type="submit">Register</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <p>Ya tienes una cuenta? <Link to="/login">Inicia sesion Aqui</Link></p>
    </form>
  );
};

export default Register;

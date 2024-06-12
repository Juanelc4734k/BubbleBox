import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Componente de registro de usuario.
 * Permite a los usuarios registrarse creando una nueva cuenta.
 */
const Register = () => {
  // Estado para almacenar los valores del formulario de registro
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Estado para almacenar mensajes de error
  const [error, setError] = useState(null);
  
  // Hook para la navegación programática
  const navigate = useNavigate();

  /**
   * Maneja los cambios en los campos del formulario.
   * Actualiza el estado del formulario con los valores introducidos por el usuario.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Maneja el envío del formulario.
   * Envía una solicitud de registro al servidor y redirige al usuario a la página de inicio de sesión si es exitoso.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      // Realiza una solicitud POST al servidor para registrar al usuario
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      console.log(res.data); // Imprime la respuesta del servidor en la consola
      navigate('/login'); // Redirige al usuario a la página de inicio de sesión
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
      <input 
        type="text" 
        name="username" 
        onChange={handleChange} 
        value={form.username} 
        placeholder="Username" 
      />
      <input 
        type="email" 
        name="email" 
        onChange={handleChange} 
        value={form.email} 
        placeholder='Email'
      />
      <input 
        type="password" 
        name="password" 
        onChange={handleChange} 
        value={form.password} 
        placeholder="Password" 
      />
      <select 
        name="role" 
        onChange={handleChange} 
        value={form.role}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>
      <button type="submit">Register</button>
      {/* Muestra el mensaje de error si hay uno */}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <p>Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </form>
  );
};

export default Register;

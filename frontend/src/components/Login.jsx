import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Componente de inicio de sesión.
 * Gestiona el formulario de inicio de sesión y redirige al perfil del usuario si el inicio de sesión es exitoso.
 */
const Login = () => {
  // Estado para almacenar los valores del formulario de inicio de sesión
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  // Estado para controlar si el usuario ha iniciado sesión
  const [loggedIn, setLoggedIn] = useState(false);

  /**
   * Maneja los cambios en los campos del formulario.
   * Actualiza el estado del formulario con los valores introducidos por el usuario.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Maneja el envío del formulario.
   * Envía una solicitud de inicio de sesión al servidor y almacena el token de autenticación si es exitoso.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      // Realiza una solicitud POST al servidor para autenticar al usuario
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      // Almacena el token en el almacenamiento local
      localStorage.setItem('token', res.data.token);
      // Actualiza el estado para indicar que el usuario ha iniciado sesión
      setLoggedIn(true);
      console.log(res.data); // Imprime la respuesta del servidor en la consola
    } catch (err) {
      // Maneja cualquier error que ocurra durante la solicitud
      console.error(err);
    }
  };

  return (
    <>
      {/* Si el usuario ha iniciado sesión, redirige al perfil */}
      {loggedIn ? <Navigate to="/profile" /> : (
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username" 
            onChange={handleChange} 
            value={form.username} 
            placeholder="Username" 
          />
          <input 
            type="password" 
            name="password" 
            onChange={handleChange} 
            value={form.password} 
            placeholder="Password" 
          />
          <button type="submit">Login</button>
          {/* Enlace para redirigir a la página de registro */}
          <p>No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </form>
      )}
    </>
  );
};

export default Login;

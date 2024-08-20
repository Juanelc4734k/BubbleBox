import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CerrarSesion = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      await axios.put('http://localhost:3000/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Puedes manejar el error aquí, por ejemplo, mostrando un mensaje al usuario
    }
  };

  return (
    <button onClick={handleLogout}>Cerrar sesión</button>
  );
};

export default CerrarSesion;
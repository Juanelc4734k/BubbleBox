import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CerrarSesion = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      
      // Eliminamos la petición al backend ya que no parece haber una ruta específica para logout
      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <button onClick={handleLogout}>Cerrar sesión</button>
  );
};

export default CerrarSesion;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CerrarSesion = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>Cerrar sesión</button>
  );
};

export default CerrarSesion;
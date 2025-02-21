import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../../services/auth';

const CerrarSesion = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if(token){
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        try {
          await logoutUser(userId);
        } catch (error) {
          console.error('Error en logoutUser:', error);
        }

        // Clear all localStorage items
        localStorage.clear();
        
        // Update authentication state
        setIsAuthenticated(false);
        
        // Force a page reload after navigation
        navigate('/login', { replace: true });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // If there's an error, clear everything and redirect anyway
      localStorage.clear();
      setIsAuthenticated(false);
      navigate('/login', { replace: true });
      window.location.reload();
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      <FaSignOutAlt />
    </button>
  );
};

export default CerrarSesion;
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CerrarSesion from '../auth/CerrarSesion';

const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const showBackButton = location.pathname !== '/home';

  return (
    <nav className="sidebar">
      <ul>
        {showBackButton && (
          <li><button onClick={handleGoBack}>Volver</button></li>
        )}
        <li><Link to="/home">Inicio</Link></li>
        <li><Link to="/users">Usuarios</Link></li>
        <li><Link to="/chats">Chats</Link></li>
        <li><Link to="/comunidades">Comunidades</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
        <li><CerrarSesion setIsAuthenticated={setIsAuthenticated} /></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
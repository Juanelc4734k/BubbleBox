import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CerrarSesion from '../auth/CerrarSesion';

const Sidebar = ({ setIsAuthenticated }) => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin') {
      // Si estamos en una subruta de administración, volvemos a la página principal de admin
      navigate('/admin');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const showBackButton = location.pathname !== '/home' && location.pathname !== '/admin';

  const renderAdminSidebar = () => (
    <nav className="sidebar admin-sidebar">
      <ul>
        {showBackButton && (
          <li><button onClick={handleGoBack}>Volver</button></li>
        )}
        <li><Link to="/admin">Panel de Control</Link></li>
        <li><Link to="/admin/usuarios">Gestión de Usuarios</Link></li>
        <li><Link to="/admin/contenido">Gestión de Contenido</Link></li>
        <li><Link to="/admin/estadisticas">Estadísticas</Link></li>
        <li><Link to="/admin/configuracion">Configuración</Link></li>
        <li><CerrarSesion setIsAuthenticated={setIsAuthenticated} /></li>
      </ul>
    </nav>
  );

  const renderUserSidebar = () => (
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

  return userRole === 'administrador' ? renderAdminSidebar() : renderUserSidebar();
};

export default Sidebar;
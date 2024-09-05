import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CerrarSesion from '../auth/CerrarSesion';
import '../../assets/css/layout/sidebar.css';
import { FaHome, FaUsers, FaComments, FaCog, FaChartBar, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdGroup } from 'react-icons/md';

const Sidebar = ({ setIsAuthenticated }) => {
  const userRole = localStorage.getItem('userRole');
  const [activeIcon, setActiveIcon] = useState(null);

  const renderMenuItem = (icon, path, tooltip, key) => {
    const Icon = icon;
    const isActive = activeIcon === key;
    return (
      <li 
        className={`menu-item ${isActive ? 'active' : ''}`} 
        data-tooltip={tooltip}
        onClick={() => setActiveIcon(key)}
      >
        <Link className={`menu-link ${isActive ? 'active' : ''}`} to={path}>
          <Icon />
        </Link>
      </li>
    );
  };

  const renderAdminSidebar = () => (
    <nav className="sidebar admin-sidebar">
      <ul className="menu">
        {renderMenuItem(MdDashboard, '/admin', 'Panel de Control', 'dashboard')}
        {renderMenuItem(FaUsers, '/admin/usuarios', 'Usuarios', 'users')}
        {renderMenuItem(MdGroup, '/admin/contenido', 'Contenido', 'content')}
        {renderMenuItem(FaChartBar, '/admin/estadisticas', 'Estadísticas', 'stats')}
        {renderMenuItem(FaCog, '/admin/configuracion', 'Configuración', 'settings')}
        <li className="menu-item" data-tooltip="Cerrar Sesión">
          <CerrarSesion setIsAuthenticated={setIsAuthenticated}>
            <FaSignOutAlt />
          </CerrarSesion>
        </li>
      </ul>
    </nav>
  );

  const renderUserSidebar = () => (
    <nav className="sidebar user-sidebar">
      <ul className="menu">
        {renderMenuItem(FaHome, '/home', 'Inicio', 'home')}
        {renderMenuItem(FaUsers, '/users', 'Usuarios', 'users')}
        {renderMenuItem(FaComments, '/chats', 'Chats', 'chats')}
        {renderMenuItem(MdGroup, '/comunidades', 'Comunidades', 'communities')}
        {renderMenuItem(FaUserCircle, '/perfil', 'Perfil', 'profile')}
        <li className="menu-item" data-tooltip="Cerrar Sesión">
          <CerrarSesion setIsAuthenticated={setIsAuthenticated}>
            <FaSignOutAlt />
          </CerrarSesion>
        </li>
      </ul>
    </nav>
  );

  return userRole === 'administrador' ? renderAdminSidebar() : renderUserSidebar();
};

export default Sidebar;
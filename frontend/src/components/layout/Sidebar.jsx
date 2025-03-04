import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CerrarSesion from '../auth/CerrarSesion';
import '../../assets/css/layout/sidebar.css';
import { FaUsers, FaCog, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdGroup } from 'react-icons/md';
import { AiOutlineHome, AiOutlineTeam  } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";
import { PiVideo } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoMdMusicalNote } from "react-icons/io";
import { IoChatbubblesOutline } from "react-icons/io5";

const Sidebar = ({ setIsAuthenticated, isExpanded }) => {
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

  const renderSidebarContent = () => (
    <ul className={`menu ${userRole === 'administrador' ? 'adminSidebar' : 'userSidebar'}`}>
      {userRole === 'administrador' ? (
        <>
          {renderMenuItem(MdDashboard, '/admin', 'Panel de Control', 'dashboard')}
          {renderMenuItem(FaUsers, '/admin/usuarios', 'Usuarios', 'users')}
          {renderMenuItem(MdGroup, '/admin/contenido', 'Contenido', 'content')}
          {renderMenuItem(FaChartBar, '/admin/estadisticas', 'Estadísticas', 'stats')}
          {renderMenuItem(FaCog, '/admin/configuracion', 'Configuración', 'settings')}
        </>
      ) : (
        <>
          {renderMenuItem(AiOutlineHome, '/home', 'Inicio', 'home')}
          {renderMenuItem(CgSearch, '/home', 'Buscar', 'search')}
          {renderMenuItem(AiOutlineTeam, '/users', 'Amigos', 'users')}
          {renderMenuItem(IoChatbubblesOutline, '/chats', 'Chats', 'chats')}
          {renderMenuItem(HiOutlineUserGroup, '/comunidades', 'Comunidades', 'communities')}
          {renderMenuItem(PiVideo, '/reels', 'Reels', 'reels')}
        </>
      )}
      <li className="menu-item" data-tooltip="Cerrar Sesión">
        <CerrarSesion setIsAuthenticated={setIsAuthenticated}>
          <FaSignOutAlt />
        </CerrarSesion>
      </li>
    </ul>
  );

  return (
    <div className="sidebar-container">
      <nav className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {renderSidebarContent()}
      </nav>
    </div>
  );
};

export default Sidebar;
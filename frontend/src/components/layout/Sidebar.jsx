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
  const [newPostsCount, setNewPostsCount] = useState(0);

  const [lastChecked, setLastChecked] = useState(
    localStorage.getItem('lastPostsCheck') || Date.now()
  );

  useEffect(() => {
    const fetchNewPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:3008/posts/new-count?lastChecked=${lastChecked}`
        );
        
        if (!response.ok) throw new Error('Error en la solicitud');
        
        const data = await response.json();
        setNewPostsCount(data.count);
        // Actualizar el timestamp en cada chequeo exitoso
        //localStorage.setItem('lastPostsCheck', Date.now());
        //setLastChecked(Date.now());
      } catch (error) {
        console.error('Error fetching new posts:', error);
      }
    };

    const interval = setInterval(fetchNewPosts, 5000);
    return () => clearInterval(interval);
  }, [lastChecked]);

  // Modify renderMenuItem to include badge counter
  const renderMenuItem = (icon, path, tooltip, key, onClick, badge) => {
    const Icon = icon;
    const isActive = activeIcon === key;
    return (
      <li
        className={`menu-item ${isActive ? 'active' : ''}`}
        data-tooltip={tooltip}
        onClick={() => {
          setActiveIcon(key);
          onClick?.();
        }}
      >
        <Link className={`menu-link ${isActive ? 'active' : ''}`} to={path}>
          <Icon />
          {badge > 0 && (
            <span className="badge" style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#ff4757',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>{badge}</span>
          )}
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
          {renderMenuItem(AiOutlineHome, '/home', 'Inicio', 'home', () => {
            setNewPostsCount(0);
            const newTimestamp = Date.now();
            setLastChecked(newTimestamp);
            localStorage.setItem('lastPostsCheck', newTimestamp);
            window.location.reload();
          }, newPostsCount)}
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
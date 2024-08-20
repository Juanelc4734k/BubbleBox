import React from 'react';
import { Link } from 'react-router-dom';
import CerrarSesion from '../auth/CerrarSesion';

const Sidebar = ({ setIsAuthenticated }) => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/home">Inicio</Link></li>
        <li><Link to="/friends">Amigos</Link></li>
        <li><Link to="/chats">Chats</Link></li>
        <li><Link to="/comunidades">Comunidades</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
        <li><CerrarSesion setIsAuthenticated={setIsAuthenticated} /></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
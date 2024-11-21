import React,{useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaUser, FaCog, FaChartBar } from 'react-icons/fa';
import logo from '../../assets/images/logo/logo.jfif';
import img from '../../assets/images/img/perfil.jpg';
import '../../assets/css/layout/navbar.css';
import { BsThreeDotsVertical } from "react-icons/bs";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');

  const handleGoBack = () => {
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin') {
      navigate('/admin');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(userRole === 'administrador' ? '/admin' : '/home');
    }
  };

  const showBackButton = (userRole === 'administrador' && location.pathname !== '/admin') || 
                         (userRole !== 'administrador' && location.pathname !== '/home');

    // Navbar para administrador
    const renderAdminNavbar = () => (
      <nav className="navbar admin-navbar">
        <div className="navbar-left">
          {showBackButton ? (
            <button type='button' className="navbar-back-button" onClick={handleGoBack}>
              <FaArrowLeft />
            </button>
          ) : (
            <div className="navbar-logo">
              <img src={logo} alt="Logo" />
            </div>
          )}
        </div>
        <div className="navbar-actions">
          <FaBell className="navbar-icon" />
          <FaUser className="navbar-icon" />
        </div>
      </nav>
    );

  //  Navbar para usuario
  const renderUserNavbar = () => (
    <nav className="navbar user-navbar">
      <div className="navbar-left">
        <div className="navbar-img">
          <img src={img} alt="Logo"/> 
        </div>
        <div className="navbar-description">
          <h3>Nombre de usuario</h3>
          <p className='text-navbar'>!Hola¡ Bienvenido a nuestra pagina BubbleBox, esperamos que puedas entretenerte.</p>
          < FaBell className="navbar-icon campana" />
        </div>

      </div>
      <div className="navbar-right">
        <div className="navbar-actions">
        <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
        
        {showBackButton ? (
          <button className="navbar-acti navbar-back-button" onClick={handleGoBack}>
            <FaArrowLeft className='ml-2' />
          </button>
        ) : (
          <div className="navbar-acti navbar-logo">
            <img src={logo} alt="Logo" />
          </div>
        )}
      </div>
    </nav>
  );

  return userRole === 'administrador' ? renderAdminNavbar() : renderUserNavbar();
};

export default Navbar;

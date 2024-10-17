import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaUser, FaCog, FaChartBar } from 'react-icons/fa';
import logo from '../../assets/images/logo/logo.jfif';
import img from '../../assets/images/img/perfil.jpg';
import '../../assets/css/layout/navbar.css';
import fondoImg from  '../../assets/images/img/fondo.jpg';


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
          <button className="navbar-back-button" onClick={handleGoBack}>
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
          <img src={img} alt="Logo" />
        </div>
        <div className="navbar-description">
          <h3>Nombre de usuario</h3>
          <p>Una pequeña descripcion la cual sera puesta por el usuario, nostros le pondriamos un limite.</p>
          < FaBell className="navbar-icon campana" />
        </div>
      </div>
      <div className="navbar-right">
        {showBackButton ? (
          <button className="navbar-back-button" onClick={handleGoBack}>
            <FaArrowLeft />
          </button>
        ) : (
          <div className="navbar-logo">
            <img src={logo} alt="Logo" />
          </div>
        )}
        <div className="navbar-actions">
          <FaUser className="navbar-icon" />
        </div>
      </div>
    </nav>
  );

  return userRole === 'administrador' ? renderAdminNavbar() : renderUserNavbar();
};

export default Navbar;

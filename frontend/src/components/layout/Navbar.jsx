import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaUser, FaCog, FaChartBar } from 'react-icons/fa';
import logo from '../../assets/images/logo/logo.jfif';
import '../../assets/css/layout/navbar.css';

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

  const renderUserNavbar = () => (
    <nav className="navbar user-navbar">
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

  return userRole === 'administrador' ? renderAdminNavbar() : renderUserNavbar();
};

export default Navbar;

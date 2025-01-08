import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaUser, FaBars, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import logo from '../../assets/images/logo/logo.jfif';
import '../../assets/css/layout/navbar.css';
import { getProfiles } from '../../services/users';
import * as jwt_decode from 'jwt-decode';
import { CiCirclePlus } from "react-icons/ci";
import { CiBookmarkPlus } from "react-icons/ci";
import { TbUsersPlus } from "react-icons/tb";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const [userProfile, setUserProfile] = useState(null);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwt_decode.jwtDecode(token);
        const loggedInUserId = decoded.userId;
        const profile = await getProfiles();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      }
    };

    fetchUserProfile();
  }, []);

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

  const toggleDescriptionVisibility = () => {
    setIsDescriptionVisible(!isDescriptionVisible);
  };

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
        <button className="navbar-toggle-button" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
    </nav>
  );

  // Navbar para usuario
  const renderUserNavbar = () => (
    <nav className={`navbar user-navbar ${isDescriptionVisible ? 'navbar-expanded' : ''}`}>
      <div className="navbar-left">
        <div className="navbar-img">
          {userProfile && (
            <img 
              src={userProfile.avatar ? `http://localhost:3009${userProfile.avatar}` : avatarPorDefecto} 
              alt="Avatar del usuario" 
            />
          )}
        </div>
        <button className="navbar-toggle-description" onClick={toggleDescriptionVisibility}>
          {isDescriptionVisible ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isDescriptionVisible && (
          <div className="navbar-description">
            <h3>{userProfile ? userProfile.username : 'Cargando...'}</h3>
            <p>¡Hola! Bienvenido a nuestra página BubbleBox, esperamos que puedas entretenerte.</p>
            <FaBell className="navbar-icon campana" />
          </div>
        )}
        {isDescriptionVisible && (
          <div className='acciones'>
            <div className='link1'>
              <p><CiCirclePlus className='icono0'/> Nueva Historia</p>
            </div>
            <div className='link2'>
              <p><TbUsersPlus className='icono0' />Nueva Comunidad</p>
            </div>
            <div className='link3'>
              <p><CiBookmarkPlus className='icono0' />Nueva publicacion</p>
            </div>
          </div>
        )}
      </div>
      <div className="navbar-right">
        <div className="navbar-actions">
          <i className="fa-solid fa-ellipsis-vertical"></i>
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
        <button className="navbar-toggle-button" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
    </nav>
  );

  return userRole === 'administrador' ? renderAdminNavbar() : renderUserNavbar();
};

export default Navbar;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaBell, FaUser, FaBars, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CiBookmarkPlus } from "react-icons/ci";
import * as jwt_decode from "jwt-decode";
import Dropdown from "./Dropdown";
import { getProfiles } from "../../services/users";
import logo from "../../assets/images/logo/logo.jfif";
import "../../assets/css/layout/navbar.css";
import CreatePost from "../posts/CreatePost";
import CreateComunity from "../comunity/CreateComunity";
import CreateStories from "../stories/CreateStories";
import Notifications from "./Notifications";
import CreateGroup from "../chats/CreateGroup";

const Navbar = ({ toggleSidebar, isCreateGroupOpen, setIsCreateGroupOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = localStorage.getItem("userRole")
  const [userProfile, setUserProfile] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s"
  const defaultDescription = "¡Holaaaa! Soy nuevo en BubbleBox y estoy muy emocionado por conectar con nuevos amigos.";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const decoded = jwt_decode.jwtDecode(token)
        const loggedInUserId = decoded.userId
        const profile = await getProfiles()
        setUserProfile(profile)
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error)
      }
    }

    fetchUserProfile()
  }, [])
  

  const handleGoBack = () => {
    if (location.pathname.startsWith("/admin") && location.pathname !== "/admin") {
      navigate("/admin")
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(userRole === "administrador" ? "/admin" : "/home")
    }
  }

  const showBackButton =
    (userRole === "administrador" && location.pathname !== "/admin") ||
    (userRole !== "administrador" && location.pathname !== "/home")

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  console.log("Estado de isCreateGroupOpen:", isCreateGroupOpen);

  // Navbar para administrador
  const renderAdminNavbar = () => (
    <nav className="navbar admin-navbar">
      <div className="navbar-left">
        {showBackButton ? (
          <button type="button" className="navbar-back-button" onClick={handleGoBack}>
            <FaArrowLeft />
          </button>
        ) : (
          <div className="navbar-logo">
            <img src={logo || "/placeholder.svg"} alt="Logo" />
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
  )

  // Navbar para usuario
  const renderUserNavbar = () => (
    <nav className={`navbar user-navbar ${isExpanded ? "expanded" : ""} ${isCreateGroupOpen ? "modal-open" : ""} `}>
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="navbar-img">
            <button className="navbar-toggle-button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              <FaBars />
            </button>
            {userProfile && (
              <img
                src={userProfile.avatar ? `http://localhost:3009${userProfile.avatar}` : avatarPorDefecto}
                alt="Avatar del usuario"
              />
            )}
          </div>
          <div className="navbar-description">
            <h3>{userProfile ? userProfile.username : "Cargando..."}</h3>
            <Notifications/>
          </div>
        </div>
        <div className="navbar-right">
          <div className="navbar-actions">
            <Dropdown />
          </div>
          {showBackButton ? (
            <button className="navbar-acti navbar-back-button" onClick={handleGoBack} aria-label="Volver">
              <FaArrowLeft />
            </button>
          ) : (
            <div className="navbar-acti navbar-logo">
              <img src={logo || "/placeholder.svg"} alt="Logo de BubbleBox" />
            </div>
          )}
        </div>
      </div>
      <button className="navbar-toggle-description" onClick={toggleExpanded} aria-expanded={isExpanded}>
        {isExpanded ? <FaChevronUp className="icono01" /> : <FaChevronDown className="icono01" />}
        <span className="sr-only">{isExpanded ? "Ocultar detalles" : "Mostrar detalles"}</span>
      </button>
      <div className="navbar-expanded-content">
        <div className="navbar-description-p">
          <p>{userProfile ? (userProfile.descripcion_usuario || defaultDescription) : "Cargando..."}</p>
        </div>
        <div className="acciones">
          <div className="link1">
            <p>
              <CreatePost/> 
            </p>
          </div>
          <div className="link2">
            <p>
              <CreateComunity/>
            </p>
          </div>
          <div className="link3">
            <p>
              <CreateStories/>
            </p>
          </div>
        </div>
      </div>
    </nav>
  )

  return userRole === "administrador" ? renderAdminNavbar() : renderUserNavbar()
}

export default Navbar


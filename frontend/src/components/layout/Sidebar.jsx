import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../../services/users";
import { getAllPosts } from "../../services/posts";
import CerrarSesion from "../auth/CerrarSesion";
import "../../assets/css/layout/sidebar.css";
import { FaUsers, FaCog, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard, MdGroup } from "react-icons/md";
import { AiOutlineHome, AiOutlineTeam } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";
import { PiVideo } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoChatbubblesOutline } from "react-icons/io5";
import { FiFilter } from "react-icons/fi"; // Icono de filtro

const Sidebar = ({ setIsAuthenticated, isExpanded }) => {
  const userRole = localStorage.getItem("userRole");
  const [activeIcon, setActiveIcon] = useState(null);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const searchTimeout = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState("Todo");
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const avatarDefault =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const filterRef = useRef(null);
  const searchRef = useRef(null); // NUEVO: Referencia para el buscador y el filtro

  // Opciones del filtro
  const filterOptions = [
    "Todo",
    "Amigos",
    "Publicaciones",
    "Comunidades",
    "Reels",
  ];
  useEffect(() => {
    if (!isExpanded) {
      setShowSearch(false);
    }
  }, [isExpanded]);

  // Ocultar el filtro cuando se haga clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [showFilter]);

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setShowFilter(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce the search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (value.trim()) {
        handleSearch(value, selectedFilter);
      } else {
        setSearchResults([]);
      }
    }, 500);
    const inputElement = e.target;
    const textLength = value.length * 8 + 50;
    inputElement.style.width = `${Math.min(Math.max(textLength, 120), 300)}px`;
  };

  const paginateResults = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const handleSearch = async (term, filter) => {
    try {
      setCurrentPage(1);
      let results = [];
      const searchTerm = term.toLowerCase();

      switch (filter.toLowerCase()) {
        case "usuarios":
        case "amigos":
          const userData = await getUsers();
          results = userData.filter((user) => {
            const nombre = user.nombre?.toLowerCase() || "";
            const username = user.username?.toLowerCase() || "";
            return (
              user.id !== currentUserId && // Exclude current user
              (nombre.includes(searchTerm) || username.includes(searchTerm))
            );
          });
          break;

        case "publicaciones":
          const posts = await getAllPosts();
          results = posts.filter((post) => {
            const contenido = post.contenido?.toLowerCase() || "";
            return contenido.includes(searchTerm);
          });
          break;

        case "todo":
          const [users, allPosts] = await Promise.all([
            getUsers(),
            getAllPosts(),
          ]);

          const filteredUsers = users.filter((user) => {
            const nombre = user.nombre?.toLowerCase() || "";
            const username = user.username?.toLowerCase() || "";
            return nombre.includes(searchTerm) || username.includes(searchTerm);
          });

          const filteredPosts = allPosts.filter((post) => {
            const contenido = post.contenido?.toLowerCase() || "";
            return contenido.includes(searchTerm);
          });

          results = { users: filteredUsers, posts: filteredPosts };
          break;

        default:
          results = [];
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    }
  };

  const [lastChecked, setLastChecked] = useState(
    localStorage.getItem("lastPostsCheck") || Date.now()
  );

  useEffect(() => {
    const fetchNewPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:3008/posts/new-count?lastChecked=${lastChecked}`
        );

        if (!response.ok) throw new Error("Error en la solicitud");

        const data = await response.json();
        setNewPostsCount(data.count);
        // Actualizar el timestamp en cada chequeo exitoso
        //localStorage.setItem('lastPostsCheck', Date.now());
        //setLastChecked(Date.now());
      } catch (error) {
        console.error("Error fetching new posts:", error);
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
        className={`menu-item ${isActive ? "active" : ""}`}
        {...(key === "search" && showSearch ? {} : { "data-tooltip": tooltip })}
        onClick={() => {
          setActiveIcon(key);
          if (key === "search") {
            setShowSearch(!showSearch); // <-- Activa o desactiva el buscador
          }
          onClick?.();
        }}
      >
        <Link className={`menu-link ${isActive ? "active" : ""}`} to={path}>
          <Icon />
          {badge > 0 && (
            <span
              className="badge"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "#ff4757",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {badge}
            </span>
          )}
        </Link>
        {key === "search" && showSearch && (
          <div
            className="search-containerSidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              className="search-inputSidebar"
              placeholder={`Buscar ${selectedFilter}...`}
              value={searchTerm}
              autoFocus
              onChange={handleInputChange}
            />
            <button className="filter-button" onClick={handleFilterClick}>
              <FiFilter />
            </button>
            {showFilter && (
              <ul className="filter-dropdown" ref={filterRef}>
                {filterOptions.map((option) => (
                  <li key={option} onClick={() => handleFilterSelect(option)}>
                    {option}
                  </li>
                ))}
              </ul>
            )}
            {/* Add search results here */}
            {(Array.isArray(searchResults)
              ? searchResults.length > 0
              : searchResults.users?.length > 0 ||
                searchResults.posts?.length > 0) && (
              <div className="search-results">
                {Array.isArray(searchResults) ? (
                  <ul>
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        {result.nombre || result.contenido}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    {searchResults.users?.length > 0 && (
                      <div>
                        <h4>Usuarios</h4>
                        <ul>
                          {paginateResults(searchResults.users).map((user) => (
                            <li key={user.id}>
                              <Link
                                to={`/perfil/${user.id}`}
                                className="user-item"
                              >
                                <img
                                  src={
                                    user.avatar
                                      ? `http://localhost:3009${user.avatar}`
                                      : avatarDefault
                                  }
                                  alt={user.nombre}
                                  className="user-avatar"
                                />
                                <span>{user.nombre}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {searchResults.users.length > itemsPerPage && (
                          <div className="pagination">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="pagination-button"
                            >
                              ←
                            </button>
                            <span className="page-info">
                              {currentPage} /{" "}
                              {Math.ceil(
                                searchResults.users.length / itemsPerPage
                              )}
                            </span>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(
                                    prev + 1,
                                    Math.ceil(
                                      searchResults.users.length / itemsPerPage
                                    )
                                  )
                                )
                              }
                              disabled={
                                currentPage >=
                                Math.ceil(
                                  searchResults.users.length / itemsPerPage
                                )
                              }
                              className="pagination-button"
                            >
                              →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {searchResults.posts?.length > 0 && (
                      <div>
                        <h4>Publicaciones</h4>
                        <ul>
                          {searchResults.posts.map((post) => (
                            <li key={post.id}>
                              <div className="post-content">
                                {post.contenido}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  const renderSidebarContent = () => (
    <ul
      className={`menu ${
        userRole === "administrador" ? "adminSidebar" : "userSidebar"
      }`}
    >
      {userRole === "administrador" ? (
        <>
          {renderMenuItem(
            MdDashboard,
            "/admin",
            "Panel de Control",
            "dashboard"
          )}
          {renderMenuItem(FaUsers, "/admin/usuarios", "Usuarios", "users")}
          {renderMenuItem(MdGroup, "/admin/contenido", "Contenido", "content")}
          {renderMenuItem(
            FaChartBar,
            "/admin/estadisticas",
            "Estadísticas",
            "stats"
          )}
          {renderMenuItem(
            FaCog,
            "/admin/configuracion",
            "Configuración",
            "settings"
          )}
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
          {renderMenuItem(CgSearch, '#', 'Buscar', 'search')}
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
      <nav className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
        {renderSidebarContent()}
      </nav>
    </div>
  );
};

export default Sidebar;

"use client"

import { useState, useEffect } from "react"
import "@fortawesome/fontawesome-free/css/all.min.css"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Communities from "./pages/Communities.jsx"
import CommunityDetail from "./components/comunity/communityDetail.jsx"
import Sidebar from "./components/layout/Sidebar"
import Navbar from "./components/layout/Navbar"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Friends from "./pages/Friends"
import Users from "./pages/Users"
import Chats from "./pages/Chats.jsx"
import Reels from "./pages/Reels.jsx"
import Profiles from "./pages/Profiles"
import RecoverPass from "./pages/RecoverPass"
import RecoverPassPage from "./pages/ResetPass"
import ProtectedRouteCommunity from "./components/auth/ProtectedRouteCommunity.jsx"
import SidebarChat from "./components/chats/SidebarChat.jsx"
import SidebarComments from "./components/comments/SidebarComments.jsx"

import { logoutUser } from "./services/auth.js"

import "./assets/css/layout/layout.css"
import "./assets/css/app/app.css"

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [showChatSidebar, setShowChatSidebar] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const [commentsContentId, setCommentsContentId] = useState(null)
  const [commentsContentType, setCommentsContentType] = useState(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarExpanded(true)
      } else if (window.innerWidth < 768) {
        setIsSidebarExpanded(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Detectar cambios de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname)

      // Si estamos en la ruta de chats, ocultar el sidebar de chat
      if (window.location.pathname === "/chats") {
        setShowChatSidebar(false)
      } else {
        // En otras rutas, mostrar el sidebar de chat si estamos en desktop
        setShowChatSidebar(window.innerWidth >= 1024)
      }
    }

    handleRouteChange()
    window.addEventListener("popstate", handleRouteChange)

    const originalPushState = history.pushState
    history.pushState = function () {
      originalPushState.apply(this, arguments)
      handleRouteChange()
    }

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
      history.pushState = originalPushState
    }
  }, [])

  // Abrir sidebar de comentarios
  const openCommentsSidebar = (contentId, contentType) => {
    setCommentsContentId(contentId)
    setCommentsContentType(contentType)
    setShowCommentsSidebar(true)

    // En móvil, ocultar el sidebar de chat si está visible
    if (window.innerWidth < 1024) {
      setShowChatSidebar(false)
    }
  }

  // Cerrar sidebar de comentarios
  const closeCommentsSidebar = () => {
    setShowCommentsSidebar(false)
    setCommentsContentId(null)
    setCommentsContentType(null)

    // En desktop, mostrar el sidebar de chat nuevamente si no estamos en /chats
    if (window.innerWidth >= 1024 && currentPath !== "/chats") {
      setShowChatSidebar(true)
    }
  }

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1]))
          const expirationTime = decodedToken.exp * 1000

          if (Date.now() >= expirationTime) {
            await logoutUser()
            localStorage.clear()
            setIsAuthenticated(false)
          } else {
            setIsAuthenticated(true)
          }
        } catch (error) {
          await logoutUser()
          localStorage.clear()
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)

    const interval = setInterval(checkAuth, 60000)

    return () => {
      window.removeEventListener("storage", checkAuth)
      clearInterval(interval)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  // Determinar clases para el contenedor principal
  // Modificar la función getAppClasses
  const getAppClasses = () => {
    let classes = "app"
  
    if (isAuthenticated) {
      classes += isSidebarExpanded ? " sidebar-visible" : " sidebar-hidden"
    }
  
    // Agregar clase para rutas de autenticación
    if (currentPath === "/login" || currentPath === "/register" || 
        currentPath === "/recover-password" || currentPath === "/recuperar-contrasena") {
      classes += " auth-route"
    }
  
    return classes
  }

  return (
    <Router>
      <div className={getAppClasses()}>
        {isAuthenticated && (
          <>
            <Navbar
              toggleSidebar={toggleSidebar}
              isCreateGroupOpen={isCreateGroupOpen}
              setIsCreateGroupOpen={setIsCreateGroupOpen}
            />
            <Sidebar
              isExpanded={isSidebarExpanded}
              setIsAuthenticated={setIsAuthenticated}
              className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}
            />

            {/* Sidebar de chat (visible en todas las rutas excepto /chats) */}
            {currentPath !== "/chats" && (
              <SidebarChat
                className={`sidebar-chat ${showChatSidebar ? "visible" : ""}`}
                onToggle={() => setShowChatSidebar(!showChatSidebar)}
              />
            )}

            {/* Sidebar de comentarios */}
            {showCommentsSidebar && (
              <SidebarComments
                contentId={commentsContentId}
                contentType={commentsContentType}
                onClose={closeCommentsSidebar}
                className={`sidebar-comments visible`}
              />
            )}
          </>
        )}

        <div className="layout">
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home openCommentsSidebar={openCommentsSidebar} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/obtener/:id"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comunidades"
                element={
                  <ProtectedRoute>
                    <Communities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comunidad/:id"
                element={
                  <ProtectedRoute>
                    <ProtectedRouteCommunity>
                      <CommunityDetail openCommentsSidebar={openCommentsSidebar} />
                    </ProtectedRouteCommunity>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/recover-password" element={<RecoverPass />} />
              <Route path="/recuperar-contrasena" element={<RecoverPassPage />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats"
                element={
                  <ProtectedRoute>
                    <Chats isCreateGroupOpen={isCreateGroupOpen} setIsCreateGroupOpen={setIsCreateGroupOpen} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reels"
                element={
                  <ProtectedRoute>
                    <Reels openCommentsSidebar={openCommentsSidebar} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/:userId"
                element={
                  <ProtectedRoute>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}


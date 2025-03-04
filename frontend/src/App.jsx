import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Communities from './pages/Communities.jsx';
import CommunityDetail from './components/comunity/communitydetail.jsx';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Friends from './pages/Friends';
import Users from './pages/Users';
import Chats from './pages/Chats.jsx';
import Reels from './pages/Reels.jsx';
import Profiles from './pages/Profiles';
import RecoverPass from './pages/RecoverPass';
import RecoverPassPage from './pages/ResetPass';
import ProtectedRouteCommunity from './components/auth/ProtectedRouteCommunity.jsx';


import { logoutUser } from './services/auth.js';

import './assets/css/layout/layout.css';
import './assets/css/app/app.css';

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 1024);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false); // Estado para el modal


  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = decodedToken.exp * 1000;
          
          if (Date.now() >= expirationTime) {
            await logoutUser();
            localStorage.clear();
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          await logoutUser();
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    // Check auth status every minute
    const interval = setInterval(checkAuth, 60000);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  }
  return (
    <Router>
      <Routes>
        
        {/* Regular app routes wrapped in the app layout */}
        <Route
          path="/*"
          element={
            <div className='app'>
              {isAuthenticated && <Navbar toggleSidebar={toggleSidebar} isCreateGroupOpen={isCreateGroupOpen} setIsCreateGroupOpen={setIsCreateGroupOpen} />}
              {isAuthenticated && <Sidebar isExpanded={isSidebarExpanded} setIsAuthenticated={setIsAuthenticated} />}
              <div className="layout">
                <main className="main-content">
                  <Routes>
                    <Route path='/' element={<ProtectedRoute><Login /></ProtectedRoute>} />
                    <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path='/comunidades' element={<ProtectedRoute><Communities /></ProtectedRoute>} />
                    <Route path='/comunidad/:id' element={<ProtectedRoute><ProtectedRouteCommunity><CommunityDetail /></ProtectedRouteCommunity></ProtectedRoute>} />
                    <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path='/recover-password' element={<RecoverPass />} />
                    <Route path='/recuperar-contrasena' element={<RecoverPassPage />} />
                    <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path='/chats' element={<ProtectedRoute><Chats isCreateGroupOpen={isCreateGroupOpen} setIsCreateGroupOpen={setIsCreateGroupOpen} /></ProtectedRoute>} />
                    <Route path='/reels' element={<ProtectedRoute><Reels /></ProtectedRoute>} />
                    <Route path='/perfil' element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
                    <Route path='/perfil/:userId' element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

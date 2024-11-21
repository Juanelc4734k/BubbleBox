import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Communities from './pages/Communities.jsx';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Friends from './pages/Friends';
import Users from './pages/Users';
import Profiles from './pages/Profiles';
import RecoverPass from './pages/RecoverPass';
import RecoverPassPage from './pages/ResetPass';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import AdminDashboard from './dashboard/pages/AdminDashboard';
import './assets/css/layout/layout.css';
import './assets/css/app/app.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('token') !== null);
    };

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <div className='app'>
        {isAuthenticated && <Navbar />}
        {isAuthenticated && <Sidebar />}
        
        <div className="layout">
          <main className="main-content">
            <Routes>
              <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path='/comunidades' element={<ProtectedRoute><Communities /></ProtectedRoute>} />
              <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path='/recover-password' element={<RecoverPass />} />
              <Route path='/recuperar-contrasena' element={<RecoverPassPage />} />
              <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path='/perfil' element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
              <Route path='/perfil/:userId' element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
              <Route path='/admin/*' element={<RoleProtectedRoute allowedRoles={['administrador']}><AdminDashboard /></RoleProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

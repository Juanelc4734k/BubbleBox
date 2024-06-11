import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';

/**
 * Componente principal de la aplicación.
 * Configura las rutas de la aplicación utilizando react-router-dom.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la raíz que redirige a /register */}
        <Route path="/" element={<Navigate to="/register" />} />
        {/* Ruta para el componente de registro */}
        <Route path="/register" element={<Register />} />
        {/* Ruta para el componente de inicio de sesión */}
        <Route path="/login" element={<Login />} />
        {/* Ruta para el componente de perfil */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

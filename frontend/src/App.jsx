import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Home from './components/pages/user/Main';
import HomeEmpleado from './components/pages/employee/Main';
import HomeAdmin from './components/pages/admin/Main';

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
        <Route path="/user" element={<Home />} />
        {/* Ruta para el componente de administrador */}
        <Route path="/admin" element={<HomeAdmin />} />
        {/* Ruta para el componente de empleado */}
        <Route path="/employee" element={<HomeEmpleado />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import Register from './components/register';
import Home from './components/Home';
import ('./css/App.css');

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Verificar si hay un token de autenticación en el almacenamiento local al cargar la aplicación
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const tokenParts = token.split('.'); // Dividir el token en tres partes separadas por puntos
      const payload = JSON.parse(atob(tokenParts[1])); // La segunda parte contiene la carga útil codificada del token
      const role = payload.rol; // Obtener el rol del objeto decodificado
      setUserRole(role); // Obtener y establecer el rol del usuario desde el token
    }
  }, []);

  const handleLogin = (rol) => {
    setIsLoggedIn(true);
    setUserRole(rol);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    localStorage.removeItem('token');
  };

  return (
    <div>
      {isLoggedIn ? (
        <Home rol={userRole} onLogout={handleLogout} />
      ) : (
        <div>
          <Login onLogin={handleLogin} />
          <Register/>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
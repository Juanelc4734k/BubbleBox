// components/Home.js
import React from 'react';
import PropTypes from 'prop-types';

function Home({ rol, onLogout }) {
    const handleLogout = () => {
        onLogout(); // Llama a la función de cierre de sesión proporcionada por el padre
      };

    return (
        <div>
            <h1>Bienvenido al sistema</h1>
            {rol === 'Administrador' ? (
                <div>
                    <h2>Panel de Administrador</h2>
                    {/* Aquí puedes mostrar contenido específico para administradores */}
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            ) : rol === 'Super_Administrador' ? (
                <div>
                    <h2>Panel de Super Administrador</h2>
                    {/* Aquí puedes mostrar contenido específico para super administradores */}
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            ) : rol === 'Usuario' ? (
                <div>
                    <h2>Panel de Usuario</h2>
                    {/* Aquí puedes mostrar contenido específico para usuarios regulares */}
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            ) : rol === 'Empleado' ? (
                <div>
                    <h2>Panel de Empleado</h2>
                    {/* Aquí puedes mostrar contenido específico para empleados */}
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            ) : (
                <div>
                    <h2>Rol no reconocido</h2>
                    {}
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            )}
        </div>
    );
}
    
// Define la validación de props
Home.propTypes = {
    rol: PropTypes.string.isRequired // Define que `rol` es una string requerida
};

export default Home;

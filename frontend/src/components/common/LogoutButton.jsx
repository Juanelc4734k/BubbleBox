import React from 'react'

const LogoutButton = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <button onClick={handleLogout}>Cerrar sesión</button>
    );
};

export default LogoutButton;
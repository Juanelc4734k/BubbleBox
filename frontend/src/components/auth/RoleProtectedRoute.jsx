import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { verificarRol } from '../../services/auth';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const response = await verificarRol();
                setUserRole(response.rol);
            } catch (error) {
                console.error('Error al verificar el rol:', error);
            } finally {
                setLoading(false);
            }
        };
        checkRole();
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to="/acceso-denegado" replace />;
    }

    return children;
};

export default RoleProtectedRoute;

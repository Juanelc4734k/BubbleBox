import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Navbar from "./Navbar";
import axios from 'axios';

/**
 * Componente de perfil de usuario.
 * Recupera y muestra la información del perfil del usuario autenticado.
 */
const Profile = () => {
    // Estado para almacenar la información del usuario
    const [user, setUser] = useState(null);

    useEffect(() => {
        /**
         * Función para recuperar la información del perfil del usuario desde el servidor.
         */
        const fetchUser = async () => {
            // Recupera el token de autenticación del almacenamiento local
            const token = localStorage.getItem('token');
            try {
                // Realiza una solicitud GET al servidor para obtener la información del perfil del usuario
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Actualiza el estado con la información del usuario
                setUser(res.data.user);
            } catch (err) {
                // Maneja cualquier error que ocurra durante la solicitud
                console.error(err);
            }
        };

        // Llama a la función para recuperar la información del perfil del usuario
        fetchUser();
    }, []);

    /**
     * Función para cerrar la sesión del usuario.
     * Elimina el token de autenticación del almacenamiento local y redirige al usuario a la página de inicio de sesión.
     */
    const handleLogout = () => {
        // Limpiar el token de autenticación del almacenamiento local
        localStorage.removeItem('token');
        // Redirigir al usuario a la página de inicio de sesión
        window.location.href = '/login';
    };

    // Renderiza un mensaje de carga mientras se recupera la información del usuario
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <Sidebar role={user.role} />
            <Navbar />
            <p>Username: {user.username}</p>
            {/* Condición para renderizar información específica para usuarios administradores */}
            {user.role === 'admin' && (
                <p>Role: Administrator</p>
            )}
            {/* Condición para renderizar información específica para usuarios normales */}
            {user.role === 'user' && (
                <p>Role: Normal User</p>
                )}
            {/* Condición para renderizar información específica para empleados */}
            {user.role === 'employee' && (
                <p>Role: Employee</p>
                )}
            {/* Botón para cerrar sesión */}
            <button onClick={handleLogout}>Cerrar sesión</button>
            <Footer />
        </div>

    );
};

export default Profile;

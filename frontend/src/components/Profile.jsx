import { useEffect, useState } from "react";
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data.user);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        // Limpiar el token de autenticación del almacenamiento local
        localStorage.removeItem('token');
        // Redirigir al usuario a la página de inicio de sesión
        window.location.href = '/login';
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <p>Username: {user.username}</p>
            {/* Condición para renderizar información específica para usuarios administradores */}
            {user.role === 'admin' && (
                <p>Role: Administrator</p>
            )}
            {/* Condición para renderizar información específica para usuarios normales */}
            {user.role !== 'admin' && (
                <p>Role: Normal User</p>
            )}
            {/* Botón para cerrar sesión */}
            <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
    );
};

export default Profile;
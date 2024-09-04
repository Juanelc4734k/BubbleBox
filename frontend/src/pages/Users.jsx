import React, { useEffect, useState } from 'react';
import User from '../components/users/User';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/users';

function Users() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getUsers();
                console.log('Todos los usuarios:', fetchedUsers);
                const loggedInUserId = localStorage.getItem('userId');
                console.log('ID del usuario logueado:', loggedInUserId);
                
                const filteredUsers = fetchedUsers.filter(user => {
                    console.log(`Usuario ${user.id}:`, user);
                    return user && 
                           user.id !== parseInt(loggedInUserId) &&
                           user.rol !== 'administrador' &&
                           user.rol !== 'moderador';
                });
                console.log('Usuarios filtrados:', filteredUsers);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleUserClick = (userId) => {
        navigate(`/perfil/${userId}`);
    };

    return (
        <div>
            <h2>Usuarios</h2>
            {users.length > 0 ? (
                users.map((user) => (
                    <div key={user.id} onClick={() => handleUserClick(user.id)}>
                        <User user={user} />
                    </div>
                ))
            ) : (
                <p>No hay usuarios para mostrar.</p>
            )}
        </div>
    );
}

export default Users;
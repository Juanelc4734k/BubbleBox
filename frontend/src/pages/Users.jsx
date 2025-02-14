import React, { useEffect, useState } from 'react';
import User from '../components/users/User';
import { getUsers } from '../services/users';
import '../assets/css/user/user.css';

function Users() {
    const [users, setUsers] = useState([]);

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

    return (
        <>
            <div className='container-usuarios'>
            {users.length > 0 ? (
                users.map((user) => (
                    <div key={user.id}>
                        <User user={user} />
                    </div>
                ))
            ) : (
                <p>No hay usuarios para mostrar.</p>
            )}
        </div>
        
        </>
    );
}

export default Users;
import React, { useEffect, useState } from 'react';
import User from '../components/users/User';
import * as jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/users';

function Users() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const fetchedUsers = await getUsers();
            const token = localStorage.getItem('token');
            const decoded = jwt_decode.jwtDecode(token);
            const loggedInUserId = decoded.userId;
            
            // Filtrar los usuarios para excluir al usuario logueado
            const filteredUsers = fetchedUsers.filter(user => user.id !== parseInt(loggedInUserId));
            setUsers(filteredUsers);
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
                <p>No hay otros usuarios para mostrar.</p>
            )}
        </div>
    );
}

export default Users;
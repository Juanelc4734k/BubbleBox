import React, { useState, useEffect } from 'react';
import { getUsers } from '../../services/users';

export const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

  return (
    <div>
        <h1>Usuarios</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}

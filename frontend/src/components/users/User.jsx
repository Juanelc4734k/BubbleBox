import React from 'react'

function User({ user }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (user.avatar) {
            return `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };
    return (
        <div className='user'>
            <p>{user.username}</p>
            <p>{user.nombre}</p>
            <p>{user.estado}</p>
            <img src={getAvatarSrc()} alt={user.username} width="100" style={{ borderRadius: '50%', objectFit: 'contain' }}/>
        </div>
    )
}

export default User;
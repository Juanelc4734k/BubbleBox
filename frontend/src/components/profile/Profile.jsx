import React from 'react';

function Profile({ profile }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (profile.avatar) {
            return `http://localhost:3009${profile.avatar}`;
        }
        return avatarPorDefecto;
    };
  return (
    <div className='profile'>
        <h1>{profile.nombre}</h1>
        <p>{profile.username}</p>
        <p>{profile.email}</p>
        <p>{profile.estado}</p>
        <img src={getAvatarSrc()} alt={profile.nombre} width="100" style={{ borderRadius: '50%', objectFit: 'contain' }}/>
    </div>
  )
}

export default Profile
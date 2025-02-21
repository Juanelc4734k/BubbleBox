import React, { useState } from 'react'
import '../../assets/css/user/user.css';
import { CiStar, CiUser  } from "react-icons/ci";
import { GoHeart } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { sendFriendRequest } from '../../services/friends';

function User({ user }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);
    const [error, setError] = useState('');

    const handleSendRequest = async () => {
      try {
        const loggedUserId = localStorage.getItem('userId');
        if (!loggedUserId) {
          setError('Debes estar logueado para enviar solicitudes');
          return;
        }
        await sendFriendRequest({idUsuario1: parseInt(loggedUserId), idUsuario2: user.id});
        setRequestSent(true);
        setError('');
      } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        setError('Error al enviar la solicitud');
      }
    }

    const getAvatarSrc = () => {
        if (user.avatar) {
            return `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };

    const handleImageClick = () => {
        navigate(`/perfil/${user.id}`);
    }


    return (
      <div className="user-card">
        <div className="user-avatar-wrapper">
          <img className="user-avatar" src={getAvatarSrc() || "/placeholder.svg"} alt={user.username} onClick={handleImageClick} style={{cursor: 'pointer'}} />
          <span className={`status-indicator ${user.estado === "conectado" ? "online" : "offline"}`}></span>
        </div>
        <div className="user-info">
          <div className="user-header">
            <h2 className="user-name"> <CiUser className="user-icon" />{user.username}</h2>
          </div>
        </div>
        <button 
          className={`request-button ${requestSent ? 'sent' : ''}`}
          onClick={handleSendRequest}
          disabled={requestSent}
        >
          <GoHeart className="heart-icon" />
          {requestSent ? 'Solicitud enviada' : 'Agregar'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    )
}

export default User;
import React, { useState, useEffect } from 'react'
import '../../assets/css/user/user.css';
import { CiStar, CiUser } from "react-icons/ci";
import { GoHeart } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { sendFriendRequest, getFriends, removeFriend, getFriendsInComun } from '../../services/friends';

function User({ user }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [error, setError] = useState('');
    const [commonFriends, setCommonFriends] = useState([]);
    
    // Add state for friendship ID
    const [friendshipId, setFriendshipId] = useState(null);
    
    useEffect(() => {
      const checkFriendshipStatus = async () => {
        try {
          const loggedUserId = localStorage.getItem('userId');
          if (!loggedUserId) return;
          
          const friends = await getFriends(loggedUserId);
          // Check if this user is in the friends list
          const friendship = friends.find(friend => 
            (friend.id_usuario1 === parseInt(user.id) && friend.id_usuario2 === parseInt(loggedUserId)) || 
            (friend.id_usuario2 === parseInt(user.id) && friend.id_usuario1 === parseInt(loggedUserId))
          );
          
          if (friendship) {
            setIsFriend(true);
            // Store the friendship ID for later use
            setFriendshipId(friendship.id);
          }
        } catch (error) {
          console.error('Error al verificar estado de amistad:', error);
        }
      };
      
      checkFriendshipStatus();
    }, [user.id]);
    
    useEffect(() => {
      const fetchCommonFriends = async () => {
        try {
          const loggedUserId = localStorage.getItem('userId');
          if (!loggedUserId || loggedUserId === user.id.toString()) return;
          
          const commonFriendsData = await getFriendsInComun(loggedUserId, user.id);
          
          if (Array.isArray(commonFriendsData)) {
            setCommonFriends(commonFriendsData);
          } else {
            setCommonFriends([]); // Evita errores si la API devuelve `undefined`
          }
        } catch (error) {
          console.error('Error al obtener amigos en común:', error);
        }
      };
      
      fetchCommonFriends();
    }, [user.id]);
    
    
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
    
    const handleRemoveFriend = async () => {
      try {
        const loggedUserId = localStorage.getItem('userId');
        if (!loggedUserId) {
          setError('Debes estar logueado para eliminar amigos');
          return;
        }
        
        if (!friendshipId) {
          setError('No se encontró la relación de amistad');
          return;
        }
        
        await removeFriend(friendshipId);
        setIsFriend(false);
        setFriendshipId(null);
        setError('');
    
        // Refrescar la lista de amigos en común
        setCommonFriends(prev => prev.filter(friend => friend.id !== user.id));
    
      } catch (error) {
        console.error('Error al eliminar amistad:', error);
        setError('Error al eliminar amistad');
      }
    };

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
          <div className="common-friends">
            {commonFriends.length > 0 ? (
              <div className="common-friends-container">
                <div className="common-friends-avatars">
                  {commonFriends.slice(0, 3).map((friend, index) => (
                    <img 
                      key={friend.amigo_comun} 
                      className="common-friend-avatar" 
                      src={friend.avatar ? `http://localhost:3009${friend.avatar}` : avatarPorDefecto} 
                      alt={friend.nombre} 
                      title={friend.nombre}
                      style={{ zIndex: 3 - index }} // Higher z-index for first images
                    />
                  ))}
                  {commonFriends.length > 3 && (
                    <div className="more-friends">+{commonFriends.length - 3}</div>
                  )}
                </div>
                <p>{commonFriends.length} {commonFriends.length === 1 ? 'amigo' : 'amigos'} en común</p>
              </div>
            ) : (
              <p className="no-common-friends">Sin amigos en común</p>
            )}
          </div>
        </div>
        {isFriend ? (
          <button 
            className="request-button remove-friend"
            onClick={handleRemoveFriend}
          >
            <CiUser className="heart-icon" />
            Eliminar
          </button>
        ) : (
          <button 
            className={`request-button ${requestSent ? 'sent' : ''}`}
            onClick={handleSendRequest}
            disabled={requestSent}
          >
            <GoHeart className="heart-icon" />
            {requestSent ? 'Solicitud enviada' : 'Agregar'}
          </button>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    )
}

export default User;
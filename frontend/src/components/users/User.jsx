import React, { useState, useEffect } from 'react'
import '../../assets/css/user/user.css';
import { CiStar, CiUser } from "react-icons/ci";
import { GoHeart } from "react-icons/go";
import { FaUserCheck, FaUserTimes, FaUserSlash, FaUserPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { sendFriendRequest, getFriends, removeFriend, getFriendsInComun, acceptFriendRequest, rejectFriendRequest, desbloquearUsuario } from '../../services/friends';

function User({ user, tabType }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);
    const [isFriend, setIsFriend] = useState(tabType === 'friends');
    const [isBlocked, setIsBlocked] = useState(tabType === 'blocked');
    const [isPending, setIsPending] = useState(tabType === 'requests');
    const [error, setError] = useState('');
    const [commonFriends, setCommonFriends] = useState([]);
    const [friendshipId, setFriendshipId] = useState(null);
    const loggedUserId = localStorage.getItem('userId');
    
    useEffect(() => {
      // Update states based on tabType
      setIsFriend(tabType === 'friends');
      setIsBlocked(tabType === 'blocked');
      setIsPending(tabType === 'requests');
      
      // If we're in the friends or blocked tab, the friendship ID is in the user object
      if ((tabType === 'friends' || tabType === 'blocked') && user && user.id) {
        setFriendshipId(user.id);
      }
    }, [tabType, user]);
    
    useEffect(() => {
      const checkFriendshipStatus = async () => {
        try {
          if (!loggedUserId || tabType !== 'all') return;
          
          const friends = await getFriends(loggedUserId);
          // Check if this user is in the friends list
          const friendship = friends.find(friend => 
            (friend.id_usuario1 === parseInt(user.id) && friend.id_usuario2 === parseInt(loggedUserId)) || 
            (friend.id_usuario2 === parseInt(user.id) && friend.id_usuario1 === parseInt(loggedUserId))
          );
          
          if (friendship) {
            setIsFriend(true);
            setFriendshipId(friendship.id);
          }
        } catch (error) {
          console.error('Error al verificar estado de amistad:', error);
        }
      };
      
      if (tabType === 'all' && user && user.id) {
        checkFriendshipStatus();
      }
    }, [user, loggedUserId, tabType]);
    
    useEffect(() => {
      const fetchCommonFriends = async () => {
        try {
          if (!loggedUserId) return;
          
          // Get the target user ID based on the tab type
          let targetUserId;
          
          if (tabType === 'all') {
            targetUserId = user.id;
          } else if (tabType === 'friends' || tabType === 'blocked') {
            // For friends and blocked tabs, determine which user ID is not the logged-in user
            targetUserId = user.id_usuario1 === parseInt(loggedUserId) 
              ? user.id_usuario2 
              : user.id_usuario1;
          } else if (tabType === 'requests') {
            // For pending requests, the sender is the target
            targetUserId = user.id_usuario1;
          }
          
          if (!targetUserId || targetUserId === parseInt(loggedUserId)) return;
          
          const commonFriendsData = await getFriendsInComun(loggedUserId, targetUserId);
          
          if (Array.isArray(commonFriendsData)) {
            setCommonFriends(commonFriendsData);
          } else {
            setCommonFriends([]);
          }
        } catch (error) {
          console.error('Error al obtener amigos en común:', error);
        }
      };
      
      fetchCommonFriends();
    }, [user, loggedUserId, tabType]);
    
    const handleSendRequest = async () => {
      try {
        if (!loggedUserId) {
          setError('Debes estar logueado para enviar solicitudes');
          return;
        }
        
        // Get the target user ID based on the tab type
        let targetUserId = user.id;
        
        await sendFriendRequest({idUsuario1: parseInt(loggedUserId), idUsuario2: targetUserId});
        setRequestSent(true);
        setError('');
      } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        setError('Error al enviar la solicitud');
      }
    }
    
    const handleRemoveFriend = async () => {
      try {
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
        
        // Refresh the page if we're in the friends tab
        if (tabType === 'friends') {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al eliminar amistad:', error);
        setError('Error al eliminar amistad');
      }
    };
    
    const handleAcceptRequest = async () => {
      try {
        if (!isPending || !user.id) {
          setError('No se puede aceptar esta solicitud');
          return;
        }
        
        await acceptFriendRequest(user.id);
        setError('');
        // Refresh the page to update the lists
        window.location.reload();
      } catch (error) {
        console.error('Error al aceptar solicitud:', error);
        setError('Error al aceptar la solicitud');
      }
    };
    
    const handleRejectRequest = async () => {
      try {
        if (!isPending || !user.id) {
          setError('No se puede rechazar esta solicitud');
          return;
        }
        
        await rejectFriendRequest(user.id);
        setError('');
        // Refresh the page to update the lists
        window.location.reload();
      } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        setError('Error al rechazar la solicitud');
      }
    };
    
    const handleUnblockUser = async () => {
      try {
        if (!isBlocked) return;
        
        // For blocked users, we need to determine which user is which
        const idUsuarioDesbloquea = parseInt(loggedUserId);
        const idUsuarioDesbloqueado = user.id_usuario1 === idUsuarioDesbloquea 
          ? user.id_usuario2 
          : user.id_usuario1;
        
        await desbloquearUsuario(idUsuarioDesbloquea, idUsuarioDesbloqueado);
        setError('');
        // Refresh the page to update the lists
        window.location.reload();
      } catch (error) {
        console.error('Error al desbloquear usuario:', error);
        setError('Error al desbloquear usuario');
      }
    };

    const getAvatarSrc = () => {
        if (tabType === 'all') {
            // Regular user object
            if (user.avatar) {
                return `http://localhost:3009${user.avatar}`;
            }
        } else if (tabType === 'friends' || tabType === 'blocked') {
            // Friendship object
            const isUser1 = user.id_usuario1 === parseInt(loggedUserId);
            const avatarField = isUser1 ? user.avatar_usuario2 : user.avatar_usuario1;
            
            if (avatarField) {
                return `http://localhost:3009${avatarField}`;
            }
        } else if (tabType === 'requests') {
            // Request object - show the requester's avatar
            if (user.avatar_usuario1) {
                return `http://localhost:3009${user.avatar_usuario1}`;
            }
        }
        
        return avatarPorDefecto;
    };

    const handleImageClick = () => {
        let profileId;
        
        if (tabType === 'all') {
            profileId = user.id;
        } else if (tabType === 'friends' || tabType === 'blocked') {
            profileId = user.id_usuario1 === parseInt(loggedUserId) 
                ? user.id_usuario2 
                : user.id_usuario1;
        } else if (tabType === 'requests') {
            profileId = user.id_usuario1;
        }
        
        if (profileId) {
            navigate(`/perfil/${profileId}`);
        }
    }
    
    const getUserName = () => {
        if (tabType === 'all') {
            return user.username || user.nombre;
        } else if (tabType === 'friends' || tabType === 'blocked') {
            return user.id_usuario1 === parseInt(loggedUserId) 
                ? user.nombre_usuario2 
                : user.nombre_usuario1;
        } else if (tabType === 'requests') {
            return user.nombre_solicitante || 'Usuario';
        }
        
        return 'Usuario';
    };
    
    const renderActionButton = () => {
        if (isBlocked) {
            return (
                <button 
                    className="request-button unblock-user"
                    onClick={handleUnblockUser}
                >
                    <FaUserPlus className="action-icon" />
                    Desbloquear
                </button>
            );
        }
        
        if (isPending) {
            return (
                <div className="request-actions">
                    <button 
                        className="request-button accept-request"
                        onClick={handleAcceptRequest}
                    >
                        <FaUserCheck className="action-icon" />
                        Aceptar
                    </button>
                    <button 
                        className="request-button reject-request"
                        onClick={handleRejectRequest}
                    >
                        <FaUserTimes className="action-icon" />
                        Rechazar
                    </button>
                </div>
            );
        }
        
        if (isFriend) {
            return (
                <button 
                    className="request-button remove-friend"
                    onClick={handleRemoveFriend}
                >
                    <FaUserSlash className="action-icon" />
                    Eliminar
                </button>
            );
        }
        
        return (
            <button 
                className={`request-button ${requestSent ? 'sent' : ''}`}
                onClick={handleSendRequest}
                disabled={requestSent}
            >
                <GoHeart className="heart-icon" />
                {requestSent ? 'Solicitud enviada' : 'Agregar'}
            </button>
        );
    };

    // Add this new function to get the user's online status
    const getUserStatus = () => {
        if (tabType === 'all') {
            return user.estado;
        } else if (tabType === 'friends' || tabType === 'blocked') {
            // For friendship objects, determine which user's status to show
            return user.id_usuario1 === parseInt(loggedUserId) 
                ? user.estado_usuario2 
                : user.estado_usuario1;
        } else if (tabType === 'requests') {
            // For pending requests, show the requester's status
            return user.estado_usuario1 || 'desconectado';
        }
        
        return 'desconectado'; // Default status
    };

    return (
      <div className="user-card">
        <div className="user-avatar-wrapper">
          <img 
            className="user-avatar" 
            src={getAvatarSrc()} 
            alt={getUserName()} 
            onClick={handleImageClick} 
            style={{cursor: 'pointer'}} 
          />
          <span className={`status-indicator ${getUserStatus() === "conectado" ? "online" : "offline"}`}></span>
        </div>
        <div className="user-info">
          <div className="user-header">
            <h2 className="user-name">
              <CiUser className="user-icon" />
              {getUserName()}
            </h2>
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
                      style={{ zIndex: 3 - index }}
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
        
        {renderActionButton()}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    )
}

export default User;
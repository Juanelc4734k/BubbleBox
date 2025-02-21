import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatPreview = ({ friend, onSelect, isSelected }) => {
  const avatarDefault = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const [avatarUrl, setAvatarUrl] = useState(avatarDefault);
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const currentUserId = localStorage.getItem('userId');
        const friendId = friend.id_usuario1 === parseInt(currentUserId) ? friend.id_usuario2 : friend.id_usuario1;
        const response = await fetch(`http://localhost:3009/users/usuario/${friendId}`);
        const userData = await response.json();
        if (userData.avatar) {
          setAvatarUrl(`http://localhost:3009${userData.avatar}`);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setAvatarUrl(avatarDefault);
      }
    };

    if (friend.id_usuario1 && friend.id_usuario2) {
      fetchAvatar();
    }
  }, [friend.id]);

  return (
    <div 
      className={`p-4 border-b cursor-pointer transition-colors ${
        isSelected ? 'bg-purple-100' : 'hover:bg-purple-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <img 
          src={avatarUrl}
          alt={friend.nombre_usuario2 || friend.nombre_usuario1 || 'User avatar'}
          className="w-12 h-12 rounded-full object-cover"
          onError={() => setAvatarUrl(avatarDefault)}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {localStorage.getItem('userId') === friend.id_usuario1.toString() 
              ? friend.nombre_usuario2 
              : friend.nombre_usuario1
            }
          </h3>
          {friend.lastMessage && (
            <p className="text-sm text-gray-500 truncate max-w-[200px]">
              {friend.lastMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ChatPreview.propTypes = {
  friend: PropTypes.shape({
    id_usuario1: PropTypes.number.isRequired,
    id_usuario2: PropTypes.number.isRequired,
    nombre_usuario1: PropTypes.string.isRequired,
    nombre_usuario2: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    lastMessage: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default ChatPreview;

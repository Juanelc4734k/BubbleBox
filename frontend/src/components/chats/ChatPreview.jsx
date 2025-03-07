import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import '../../assets/css/chats/chatsPreview.css';

const ChatPreview = ({ friend, onSelect, isSelected }) => {
  const avatarDefault = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const [avatarUrl, setAvatarUrl] = useState(avatarDefault);
  const [connectionStatus, setConnectionStatus] = useState('desconectado');
  const [lastMessage, setLastMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const friendId = friend.id_usuario1 === parseInt(currentUserId) ? friend.id_usuario2 : friend.id_usuario1;

  useEffect(() => {
    // Connect to socket
    socketRef.current = io("http://localhost:3001", {
      path: "/socket.io",
      transports: ["websocket"],
    });

    // Join chat room
    if (socketRef.current) {
      socketRef.current.emit("join_chat", {
        senderId: parseInt(currentUserId),
        receiverId: parseInt(friendId),
      });

      // Listen for new messages
      socketRef.current.on("receive_private_message", (message) => {
        if ((message.senderId === parseInt(friendId) && message.receiverId === parseInt(currentUserId)) ||
            (message.senderId === parseInt(currentUserId) && message.receiverId === parseInt(friendId))) {
          // Update last message
          setLastMessage(message.message);
          
          // If we're not in the selected chat and the message is from the friend, increment unread count
          if (!isSelected && message.senderId === parseInt(friendId)) {
            setUnreadCount(prev => prev + 1);
          } else if (isSelected && message.senderId === parseInt(friendId)) {
            // If we are in the selected chat, mark as read immediately
            markMessagesAsRead();
          }
        }
      });

      // Listen for audio messages
      socketRef.current.on("receive_audio_message", (message) => {
        if ((message.senderId === parseInt(friendId) && message.receiverId === parseInt(currentUserId)) ||
            (message.senderId === parseInt(currentUserId) && message.receiverId === parseInt(friendId))) {
          // Update last message for audio
          const duration = message.duration || '0:00';
          setLastMessage(`Audio (${duration})`);
          
          // If we're not in the selected chat and the message is from the friend, increment unread count
          if (!isSelected && message.senderId === parseInt(friendId)) {
            setUnreadCount(prev => prev + 1);
          } else if (isSelected && message.senderId === parseInt(friendId)) {
            // If we are in the selected chat, mark as read immediately
            markMessagesAsRead();
          }
        }
      });

      socketRef.current.on("messages_read", (data) => {
        if (data.chatId === friendId || data.userId === friendId) {
          // Reset unread count when the other user reads our messages
          setUnreadCount(0);
        }
      });
    }

    const fetchAvatar = async () => {
      try {
        const response = await fetch(`http://localhost:3009/users/usuario/${friendId}`);
        const userData = await response.json();
        if (userData.avatar) {
          setAvatarUrl(`http://localhost:3009${userData.avatar}`);
        }
        // Update connection status if available in the response
        if (userData.estado) {
          setConnectionStatus(userData.estado);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setAvatarUrl(avatarDefault);
      }
    };

    if (friend.id_usuario1 && friend.id_usuario2) {
      fetchAvatar();
      fetchLastMessage();
      fetchUnreadCount();
    }
    // Cleanup socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_private_message");
        socketRef.current.off("receive_audio_message");
        socketRef.current.off("messages_read");
      }
    };
  }, [friend.id_usuario1, friend.id_usuario2, friendId, currentUserId, isSelected]);

  // Reset unread count when chat is selected
  useEffect(() => {
    // Check if this chat is selected when the component mounts or when selection changes
    if (isSelected) {
      setUnreadCount(0);
      markMessagesAsRead();
    }
  }, [isSelected, friendId]);

  const markMessagesAsRead = async () => {
    try {
      await fetch(`http://localhost:3001/chats/markAsRead/${currentUserId}/${friendId}`, {
        method: 'PUT'
      });
      console.log(`Marked messages as read for chat with ${friendId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  const fetchLastMessage = async () => {
    try {
      const response = await fetch(`http://localhost:3001/chats/messages/${currentUserId}/${friendId}`);
      const messages = await response.json();
      
      if (messages && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        
        if (lastMsg.message === "audio_message" || lastMsg.audio_path) {
          const duration = lastMsg.duration || '0:00';
          setLastMessage(`Audio (${duration})`);
        } else if (lastMsg.message) {
          setLastMessage(lastMsg.message);
        } else {
          setLastMessage('');
        }
      } else {
        setLastMessage('');
      }
    } catch (error) {
      console.error('Error fetching last message:', error);
      setLastMessage('');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // You'll need to create this endpoint in your backend
      const response = await fetch(`http://localhost:3001/chats/unread/${currentUserId}/${friendId}`);
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div 
        className={`chat-preview ${isSelected ? 'active' : ''}`}
        onClick={() => {
          onSelect();
          if (unreadCount > 0) {
            markMessagesAsRead();
            setUnreadCount(0);
          }
        }}
    >
        <div className="flex items-center space-x-5">
          <div className="imgstado">
            <img 
                src={avatarUrl}
                alt={friend.nombre_usuario2 || friend.nombre_usuario1 || 'User avatar'}
                className="chat-avatar"
                onError={() => setAvatarUrl(avatarDefault)}
            />
            <span className={`status-indicator-chat ${
                    connectionStatus === 'conectado' ? 'bg-green-500' : 'bg-red-500'
             }`}></span>
          </div>
          <div className="flex-1 PreviewChat">
            <div className="flex justify-between items-center">
              <h3 className="chat-name truncate">
                {localStorage.getItem('userId') === friend.id_usuario1.toString() 
                  ? friend.nombre_usuario2 
                  : friend.nombre_usuario1
                }
              </h3>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </div>
            <p className="chat-message truncate">
              {lastMessage}
            </p>
          </div>
        </div>
    </div>
  );
};

// Define prop types for the component
ChatPreview.propTypes = {
  friend: PropTypes.shape({
    id_usuario1: PropTypes.number.isRequired,
    id_usuario2: PropTypes.number.isRequired,
    nombre_usuario1: PropTypes.string.isRequired,
    nombre_usuario2: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    lastMessage: PropTypes.string,
    estado: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default ChatPreview;
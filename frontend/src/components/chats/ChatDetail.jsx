import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import "../../assets/css/chats/chatsDetails.css";
import { IoClose } from "react-icons/io5"
import { FaRegFaceSmileWink } from "react-icons/fa6";
const ChatDetail = ({ chatId, onMessageSent, onCloseChat }) => {

  const avatarDefault = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";

  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(avatarDefault);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const senderId = localStorage.getItem('userId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!chatId || !senderId) return;

    const fetchInitialMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3001/chats/messages/${senderId}/${chatId}`);
        const data = await response.json();
        setMessages(data);

        const userResponse = await fetch(`http://localhost:3000/users/usuario/${chatId}`);
        const userData = await  userResponse.json();
        setFriendUser(userData);
        setAvatarUrl(userData.avatar ? `http://localhost:3009${userData.avatar}` : avatarDefault);

            // Obtener el avatar del usuario actual
      const currentUserResponse = await fetch(`http://localhost:3000/users/usuario/${senderId}`);
      const currentUserData = await currentUserResponse.json();
      const currentUserAvatar = currentUserData.avatar ? `http://localhost:3009${currentUserData.avatar}` : avatarDefault;

            // Agregar avatares a los mensajes
      const messagesWithAvatars = data.map(msg => ({
        ...msg,
        avatar: msg.sender_id === parseInt(senderId) ? currentUserAvatar : (userData.avatar ? `http://localhost:3009${userData.avatar}` : avatarDefault)
      }));

      setMessages(messagesWithAvatars);
      } catch (err) {
        setError('Error loading messages');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    socketRef.current = io('http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      socketRef.current.emit('join_chat', {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId)
      });
      fetchInitialMessages();
    });

    socketRef.current.on('receive_private_message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => {
        const newMessage = {
          id: message.id,
          sender_id: parseInt(message.senderId),
          receiver_id: parseInt(message.receiverId),
          message: message.message,
          created_at: message.created_at
        };

        if (message.temp_id && parseInt(message.senderId) === parseInt(senderId)) {
          return prev;
        }

        const messageExists = prev.some(m => 
          m.id === newMessage.id || 
          (m.message === newMessage.message && 
           m.sender_id === newMessage.sender_id &&
           Math.abs(new Date(m.created_at) - new Date(newMessage.created_at)) < 1000)
        );

        if (!messageExists) {
          return [...prev, newMessage].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
        }
        return prev;
      });
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId, senderId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current?.connected) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const messageData = {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
        message: newMessage.trim(),
        temp_id: tempId
      };

      // Add to pending messages
      setPendingMessages(prev => new Set([...prev, tempId]));

      // Add temporary message to UI
      setMessages(prev => [...prev, {
        id: tempId,
        sender_id: parseInt(senderId),
        receiver_id: parseInt(chatId),
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        pending: true, 
      }]);

      socketRef.current.emit('send_private_message', messageData);
      setNewMessage('');
      
      // Notify parent component
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error sending message');
    }
  };

  // Add message confirmation handler
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('message_sent_confirmation', ({ temp_id, id }) => {
      setPendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(temp_id);
        return newSet;
      });

      setMessages(prev => prev.map(msg => 
        msg.id === temp_id ? { ...msg, id, pending: false } : msg
      ));
    });

    return () => {
      socketRef.current?.off('message_sent_confirmation');
    };
  }, []);

  return (
    <div className="chat-detail-container">
      <div className="chat-header">
        <button onClick={onCloseChat} className="close-chat-button">
            <IoClose />
        </button>
        <img src={avatarUrl} alt={friendUser.nombre} className="imgChatDetail"/>
        <h2 className="textChatH">{friendUser.nombre}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
         <div
         key={message.id}
         className={`message-wrapper ${message.sender_id === Number.parseInt(senderId) ? "sent" : "received"}`}
        >
         <img src={message.avatar || "/placeholder.svg"} alt="Avatar" className="message-avatar" />
         <div className="message-content-wrapper">
           <div className="message-bubble">
             <span className="message-text">{message.message}</span>
           </div>
           {message.pending && <span className="message-status">Sending...</span>}
         </div>
       </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="flex space-x-2">
          <button type="button" className="emoji-button">
              <FaRegFaceSmileWink/>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
);
};

export default ChatDetail;
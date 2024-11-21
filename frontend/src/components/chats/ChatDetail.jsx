import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages, sendMessage } from '../../services/chats';
import io from 'socket.io-client';

function ChatDetail() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const senderId = localStorage.getItem('userId');
  const receiverId = chatId;
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:3000/chats');

    socketRef.current.on('receive_private_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on('error', (errorMessage) => {
      setError(errorMessage);
    });

    socketRef.current.emit('join_chat', senderId);

    return () => {
      socketRef.current.disconnect();
    };
  }, [senderId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try { 
        setIsLoading(true);
        const fetchedMessages = await getChatMessages(senderId, receiverId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        setError('Ocurrió un error al cargar los mensajes. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, senderId, receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        const sentMessage = await sendMessage(senderId, receiverId, newMessage);
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        socketRef.current.emit('send_private_message', {
          senderId,
          receiverId,
          message: newMessage
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        setError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      }
    }
  };

  if (isLoading) return <div>Cargando mensajes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-detail">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={message.id || index} className={`message ${message.sender_id === senderId ? 'sent' : 'received'}`}>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default ChatDetail;

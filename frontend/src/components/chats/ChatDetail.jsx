import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatDetail = ({ chatId, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
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
        pending: true
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
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${
              message.sender_id === parseInt(senderId) ? 'sent' : 'received'
            }`}
          >
            <div className="flex items-end gap-2">
              <span>{message.message}</span>
              {message.pending && (
                <span className="text-xs opacity-70">Sending...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="flex space-x-2">
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
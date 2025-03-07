import React, { useState, useEffect, useRef, useReducer, lazy, Suspense } from "react";
import io from "socket.io-client";
import "../../assets/css/chats/chatsDetails.css";
import { IoClose } from "react-icons/io5";
import { FaRegFaceSmileWink } from "react-icons/fa6";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";

const EmojiPicker = lazy(() => import ('emoji-picker-react'))

const ChatDetail = ({ chatId, onMessageSent, onCloseChat }) => {
  const avatarDefault =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(avatarDefault);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEmojiPickerInitialized, setIsEmojiPickerInitialized] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [currentUserAvatar, setCurrentUserAvatar] = useState(avatarDefault);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAudioId, setCurrentAudioId] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const senderId = localStorage.getItem("userId");

  const toggleEmojiPicker = () => {
    if (!isEmojiPickerInitialized && !showEmojiPicker) {
      setIsEmojiPickerInitialized(true);
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    if (!chatId || !senderId) return;

    const fetchInitialMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:3001/chats/messages/${senderId}/${chatId}`
        );
        const data = await response.json();
        
        // Get user data
        const userResponse = await fetch(
          `http://localhost:3000/users/usuario/${chatId}`
        );
        const userData = await userResponse.json();
        console.log(userData);
        setFriendUser(userData);
        setAvatarUrl(userData.avatar ? `http://localhost:3009${userData.avatar}` : avatarDefault);

        // Obtener el avatar del usuario actual
        const currentUserResponse = await fetch(`http://localhost:3000/users/usuario/${senderId}`);
        const currentUserData = await currentUserResponse.json();
        const currentUserAvatarUrl = currentUserData.avatar ? `http://localhost:3009${currentUserData.avatar}` : avatarDefault;
        setCurrentUserAvatar(currentUserAvatarUrl);

        // Create a Set to track message IDs we've already processed
        const processedMessageIds = new Set();
        
        const messagesWithAvatars = data.reduce((acc, msg) => {
          // Skip if we've already processed this message ID
          if (processedMessageIds.has(msg.id)) {
            return acc;
          }
          
          // Add this ID to our processed set
          processedMessageIds.add(msg.id);
          
          const isAudioMessage = msg.audio_path || (msg.message === null && msg.audio_path);
          
          let audioUrl = null;
          if (isAudioMessage) {
            if (msg.audio_path) {
              audioUrl = `http://localhost:3001${msg.audio_path}`;
            } else if (msg.audioUrl) {
              audioUrl = msg.audioUrl.startsWith('http') 
                ? msg.audioUrl 
                : `http://localhost:3001${msg.audioUrl}`;
            }
          }
          
          const formattedMessage = {
            ...msg,
            message: isAudioMessage ? "audio_message" : msg.message,
            audio_url: audioUrl,
            duration: msg.duration || "0:00",
            avatar: msg.sender_id === parseInt(senderId) 
              ? currentUserAvatarUrl 
              : (userData.avatar ? `http://localhost:3009${userData.avatar}` : avatarDefault)
          };
          
          acc.push(formattedMessage);
          return acc;
        }, []);

        setMessages(messagesWithAvatars);

        // Rest of the function remains the same
        setAvatarUrl(
          userData.avatar
            ? `http://localhost:3009${userData.avatar}`
            : avatarDefault
        );
        if (userData.estado) {
          setIsOnline(userData.estado === "conectado");
        } else {
          setIsOnline(false);
        }
        if (userData.lastSeen) {
          setLastSeen(userData.lastSeen);
        }
      } catch (err) {
        setError("Error loading messages");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    socketRef.current = io("http://localhost:3001", {
      path: "/socket.io",
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat server");
      
      // Join chat room and set online status
      socketRef.current.emit("join_chat", {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
      });
      
      // Set our status as online
      socketRef.current.emit("user_online", {
        userId: parseInt(senderId),
        status: "conectado"
      });
      
      // Fetch messages and initial status
      fetchInitialMessages();
      
      // Request other user's status after a short delay
      setTimeout(() => {
        socketRef.current.emit("request_user_status", {
          requesterId: parseInt(senderId),
          userId: parseInt(chatId)
        });
      }, 300);
    });

    socketRef.current.on("user_typing", (data) => {
      console.log("Typing event received:", data);
      if (parseInt(data.userId) === parseInt(chatId)) {
        console.log("User is typing");
        setIsTyping(true);

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          console.log("Typing timeout cleared");
          setIsTyping(false);
        }, 3000);
      }
    });

    socketRef.current.on("user_online_status", (data) => {
      console.log("Online status received:", data);
      if (parseInt(data.userId) === parseInt(chatId)) {
        console.log(
          "Setting online status for user",
          chatId,
          "to",
          data.isOnline
        );
        setIsOnline(Boolean(data.isOnline));
        if (!data.isOnline && data.lastSeen) {
          console.log("Setting last seen:", data.lastSeen);
          setLastSeen(data.lastSeen);
        }
      }
    });

    socketRef.current.on("receive_private_message", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => {
        let messageAvatar;
        if (parseInt(message.senderId) === parseInt(senderId)) {
          messageAvatar = message.senderAvatar || currentUserAvatar;
        } else {
          messageAvatar = message.senderAvatar || avatarUrl;
        }
        const newMessage = {
          id: message.id,
          sender_id: parseInt(message.senderId),
          receiver_id: parseInt(message.receiverId),
          message: message.message,
          created_at: message.created_at,
          avatar: messageAvatar
        };

        if (
          message.temp_id &&
          parseInt(message.senderId) === parseInt(senderId)
        ) {
          return prev;
        }

        const messageExists = prev.some(
          (m) =>
            m.id === newMessage.id ||
            (m.message === newMessage.message &&
              m.sender_id === newMessage.sender_id &&
              Math.abs(
                new Date(m.created_at) - new Date(newMessage.created_at)
              ) < 1000)
        );

        if (!messageExists) {
          return [...prev, newMessage].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        }
        return prev;
      });
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error);
    });

    return () => {
      if (socketRef.current?.connected) {
        // Emit that we're leaving the chat but still online
        socketRef.current.emit("leave_chat", {
          userId: parseInt(senderId),
          chatId: parseInt(chatId)
        });
      }
      socketRef.current?.disconnect();
    };
  }, [chatId, senderId]);
  // Store socket reference globally for logout access
    useEffect(() => {
      if (socketRef.current) {
        window.chatSocket = socketRef.current;
      }
      
      // Handle component unmount - set user as offline
      return () => {
        if (socketRef.current?.connected) {
          console.log("Component unmounting, setting user offline");
          socketRef.current.emit("user_offline", {
            userId: parseInt(senderId),
            lastSeen: new Date().toISOString()
          });
        }
        
        if (window.chatSocket === socketRef.current) {
          window.chatSocket = null;
        }
      };
    }, [senderId]);
  // Add this new effect for handling status requests
  useEffect(() => {
    if (!socketRef.current) return;
    
    // Handle status request events
    socketRef.current.on("request_user_status", (data) => {
      console.log("Received status request from:", data.requesterId, "for user:", data.userId);
      
      // If someone is requesting our status, respond directly
      if (parseInt(data.userId) === parseInt(senderId)) {
        console.log("Responding to status request with online status");
        socketRef.current.emit("user_status_response", {
          responderId: parseInt(senderId),
          requesterId: parseInt(data.requesterId),
          isOnline: true
        });
      }
    });
    
    // Handle direct status responses
    socketRef.current.on("user_status_response", (data) => {
      console.log("Received direct status response:", data);
      if (parseInt(data.responderId) === parseInt(chatId)) {
        console.log("Setting online status from direct response for user", chatId);
        setIsOnline(Boolean(data.isOnline));
        forceUpdate();
      }
    });
    
    return () => {
      socketRef.current?.off("request_user_status");
      socketRef.current?.off("user_status_response");
    };
  }, [senderId, chatId, forceUpdate]);

  useEffect(() => {
    if (!socketRef.current) return;
    
    const handleOnlineStatusEvent = (data) => {
      console.log("Online status received:", data);
      if (parseInt(data.userId) === parseInt(chatId)) {
        console.log("Setting online status for user", chatId, "to", data.isOnline);
        // Ensure we're setting a boolean value
        setIsOnline(data.isOnline === true);
        forceUpdate(); // Force re-render
        
        // Only update lastSeen if user is actually offline
        if (data.isOnline !== true && data.lastSeen) {
          console.log("Setting last seen:", data.lastSeen);
          setLastSeen(data.lastSeen);
          forceUpdate(); // Force re-render
        }
      }
    };
    
    // Handle leave chat event
    const handleLeaveChat = (data) => {
      if (parseInt(data.userId) === parseInt(chatId)) {
        // Don't set as offline, just note they left the chat
        console.log("User left chat but still online");
      }
    };
    
    socketRef.current.off("user_online_status").on("user_online_status", handleOnlineStatusEvent);
    socketRef.current.off("leave_chat").on("leave_chat", handleLeaveChat);
    
    return () => {
      socketRef.current?.off("user_online_status");
      socketRef.current?.off("leave_chat");
    };
  }, [chatId, forceUpdate]);
   const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current?.connected && e.target.value.trim() !== "") {
      console.log("Emitting typing event from", senderId, "to", chatId);
      socketRef.current.emit("user_typing", {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
        userId: parseInt(senderId) // Make sure userId is included
      });
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current?.connected) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const messageData = {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
        message: newMessage.trim(),
        temp_id: tempId,
        senderAvatar: currentUserAvatar
      };

      setPendingMessages((prev) => new Set([...prev, tempId]));

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender_id: parseInt(senderId),
          receiver_id: parseInt(chatId),
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
          pending: true,
          avatar: currentUserAvatar
        },
      ]);

      socketRef.current.emit("send_private_message", messageData);
      setNewMessage("");
      setShowEmojiPicker(false)

      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message");
    }
  };

  // Formatear tiempo de grabación
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update the toggleAudioPlayback function
  const toggleAudioPlayback = (audioId, audioUrl) => {
    if (currentAudioId === audioId) {
      // Si este audio ya está reproduciéndose/pausado
      if (audioPlayerRef.current.paused) {
        audioPlayerRef.current.play();
      } else {
        audioPlayerRef.current.pause();
      }
    } else {
      // Si es un audio diferente
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      try {
        audioPlayerRef.current = new Audio(audioUrl);
        
        // Fix: Handle duration calculation properly
        audioPlayerRef.current.addEventListener('loadedmetadata', () => {
          const duration = audioPlayerRef.current.duration;
          console.log("Audio duration:", duration, "for audio ID:", audioId);
          
          if (!isNaN(duration) && isFinite(duration)) {
            const formattedDuration = formatTime(duration);
            console.log("Formatted duration:", formattedDuration);
            
            if (audioId !== 'preview') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === audioId 
                    ? { ...msg, duration: formattedDuration } 
                    : msg
                )
              );
            }
          }
        });
        
        audioPlayerRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          // Set a default duration if there's an error
          if (audioId !== 'preview') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === audioId ? { ...msg, duration: '0:00' } : msg
              )
            );
          }
        });
        
        audioPlayerRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
        
        setCurrentAudioId(audioId);
        
        audioPlayerRef.current.onended = () => {
          setCurrentAudioId(null);
        };
      } catch (err) {
        console.error("Error playing audio:", err);
        setCurrentAudioId(null);
      }
    }
  };

  // Iniciar grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Liberar stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Iniciar grabación
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar temporizador
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("No se pudo acceder al micrófono");
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Detener temporizador
      clearInterval(recordingTimerRef.current);
    }
  };

  // Cancelar grabación
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      
      // Detener temporizador
      clearInterval(recordingTimerRef.current);
    }
  };

  // Enviar mensaje de audio
  const sendAudioMessage = async () => {
    if (!audioBlob || !socketRef.current?.connected) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const duration = formatTime(recordingTime);
      
      // Crear FormData para enviar el archivo de audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('senderId', senderId);
      formData.append('receiverId', chatId);
      formData.append('temp_id', tempId);
      formData.append('duration', duration);
      formData.append('senderAvatar', currentUserAvatar)
      
      // Añadir a mensajes pendientes
      setPendingMessages((prev) => new Set([...prev, tempId]));
      
      // Crear URL temporal para el blob de audio
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Añadir mensaje temporal a la UI
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender_id: parseInt(senderId),
          receiver_id: parseInt(chatId),
          message: "audio_message",
          audio_url: audioUrl,
          duration: duration,
          created_at: new Date().toISOString(),
          pending: true,
          avatar: currentUserAvatar,
        },
      ]);

      console.log("Sending audio message with temp_id:", tempId);
      
      // Enviar al servidor
      const response = await fetch('http://localhost:3001/chats/audio-message', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log("Audio message upload response:", responseData);
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_audio_message', {
          senderId: parseInt(senderId),
          receiverId: parseInt(chatId),
          temp_id: tempId,
          audioPath: responseData.audioPath || responseData.filePath,
          id: responseData.id || responseData.messageId,
          duration: duration,
          created_at: new Date().toISOString(),
          senderAvatar: currentUserAvatar
        });
      }
      
      // Resetear blob de audio
      setAudioBlob(null);
      
      console.log("Audio message sent successfully");

      // Manually update the message status if confirmation doesn't come quickly
      setTimeout(() => {
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(tempId)) {
            newSet.delete(tempId);
            // Also update the message to not show pending
            setMessages((prevMsgs) =>
              prevMsgs.map((msg) =>
                msg.id === tempId ? { ...msg, pending: false } : msg
              )
            );
          }
          return newSet;
        });
      }, 3000);

      if (typeof onMessageSent === 'function') {
        // Use setTimeout to ensure UI updates before refreshing the chat list
        setTimeout(() => {
          onMessageSent();
        }, 500);
      }
    } catch (err) {
      console.error("Error sending audio message:", err);
      setError("Error al enviar mensaje de audio");
    }
  };
  
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("message_sent_confirmation", ({ temp_id, id }) => {
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(temp_id);
        return newSet;
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === temp_id ? { ...msg, id, pending: false } : msg
        )
      );
    });

      // Fix: Move these handlers outside of the message_sent_confirmation handler
    socketRef.current.on('receive_audio_message', (message) => {
      console.log("Received audio message:", message);
      
      setMessages((prev) => {
        const audioUrl = message.audioPath ? 
          `http://localhost:3001${message.audioPath}` : 
          (message.audioUrl ? 
            (message.audioUrl.startsWith('http') ? 
              message.audioUrl : 
              `http://localhost:3001${message.audioUrl}`) : 
            null);

        // Get the correct avatar URL for the sender
        let messageAvatar;
        if (parseInt(message.senderId) === parseInt(senderId)) {
          messageAvatar = message.senderAvatar || currentUserAvatar;
        } else {
          // This is the friend's avatar
          messageAvatar = message.senderAvatar || avatarUrl;
        }
            
        const newMessage = {
          id: message.id,
          sender_id: parseInt(message.senderId),
          receiver_id: parseInt(message.receiverId),
          message: "audio_message",
          audio_url: audioUrl,
          duration: message.duration || "0:00", // Default duration that will be updated when played
          created_at: message.created_at || message.createdAt,
          avatar: messageAvatar
        };

        if (
          message.temp_id &&
          parseInt(message.senderId) === parseInt(senderId)
        ) {
          return prev;
        }

        const messageExists = prev.some(
          (m) => m.id === newMessage.id
        );

        if (!messageExists) {
          return [...prev, newMessage].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        }
        return prev;
      });
    });

    socketRef.current.on('audio_message_sent_confirmation', ({ temp_id, id, audioPath }) => {
      console.log("Audio message confirmation received:", { temp_id, id, audioPath });
      
      // Make sure we remove from pending messages
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(temp_id);
        return newSet;
      });

      // Update the message with the permanent ID and server URL
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === temp_id ? { 
            ...msg, 
            id, 
            pending: false,
            audio_url: `http://localhost:3001${audioPath}`
          } : msg
        );
        
        console.log("Updated messages after confirmation:", 
          updatedMessages.find(m => m.id === id || m.id === temp_id));
        
        return updatedMessages;
      });
      
      // Force a re-render to ensure UI updates
      forceUpdate();
      
      // Now it's safe to call onMessageSent
      if (typeof onMessageSent === 'function') {
        setTimeout(() => {
          try {
            onMessageSent();
          } catch (error) {
            console.error("Error in onMessageSent callback:", error);
          }
        }, 500);
      }
    });

    return () => {
      socketRef.current?.off("message_sent_confirmation");
      socketRef.current?.off('receive_audio_message');
      socketRef.current?.off('audio_message_sent_confirmation');
    };
  }, []);
  // Renderizar contenido del mensaje según su tipo
  const renderMessageContent = (message) => {
    if (message.message === "audio_message") {
      const isPlaying = currentAudioId === message.id;
      
      return (
        <div className="audio-message">
          <button 
            className="audio-control-button"
            onClick={() => toggleAudioPlayback(message.id, message.audio_url)}
          >
            {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
          </button>
          <div className={`audio-waveform ${isPlaying ? 'playing' : 'paused'}`}>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
          </div>
          <span className="audio-duration">
            {message.duration || "0:00"}
          </span>
          {message.pending && (
            <span className="text-xs opacity-70 ml-2">Sending...</span>
          )}
        </div>
      );
    } else {
      // Mensaje de texto normal
      return (
        <div className="flex items-end gap-2">
          <span>{message.message}</span>
          {message.pending && (
            <span className="text-xs opacity-70">Sending...</span>
          )}
        </div>
      );
    }
  };
  return (
    <div className="chat-detail-container">
      <div className="chat-header">
        <button onClick={onCloseChat} className="close-chat-button">
          <IoClose />
        </button>
        <img
          src={avatarUrl}
          alt={friendUser.nombre}
          className="imgChatDetail"
        />
        <div className="user-info">
          <h2 className="textChatH">{friendUser.nombre}</h2>
          <div className="user-status">
            {isTyping ? (
              <span className="typing-status">Escribiendo...</span>
            ) : isOnline ? (
              <span className="online-status">En línea</span>
            ) : lastSeen ? (
              <span className="last-seen">
                Última vez:{" "}
                {new Date(lastSeen).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : (
              <span className="offline-status">Desconectado</span>
            )}
            <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>
              Estado:{" "}
              {isTyping ? "typing" : isOnline ? "conectado" : "desconectado"}
            </div>
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-container ${
              message.sender_id === parseInt(senderId) ? "sent-container" : "received-container"
            }`}
          >
            {message.sender_id !== parseInt(senderId) && (
              <img 
                src={message.avatar || avatarUrl} 
                alt="User avatar" 
                className="message-avatar sender-avatar"
                onError={(e) => e.target.src = avatarDefault}
              />
            )}
            <div
              className={`message-bubble ${
                message.sender_id === parseInt(senderId) ? "sent" : "received"
              }`}
            >
              {renderMessageContent(message)}
            </div>
            {message.sender_id === parseInt(senderId) && (
              <img 
                src={message.avatar || currentUserAvatar} 
                alt="My avatar" 
                className="message-avatar receiver-avatar"
                onError={(e) => e.target.src = avatarDefault}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="flex space-x-2">
          {!isRecording ? (
            <>
              <button type="button" className="emoji-button" onClick={toggleEmojiPicker}>
                <FaRegFaceSmileWink />
              </button>
              <button 
                type="button" 
                className="mic-button"
                onClick={startRecording}
              >
                <FaMicrophone />
              </button>
              {isEmojiPickerInitialized && (
                <div className={`emoji-picker-container ${showEmojiPicker ? 'visible' : 'hidden'}`}>
                  <Suspense fallback={<div className="loading-emoji">Cargando emojis...</div>}>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      disableAutoFocus={true}
                      searchPlaceholder="Buscar emoji..."
                      width={300}
                      height={400}
                      lazyLoadEmojis={true}
                    />
                  </Suspense>
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
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
            </>
          ) : (
            <div className="recording-container">
              <div className="recording-indicator">
                <FaStop onClick={stopRecording} className="stop-recording-button" />
                <span className="recording-time">{formatTime(recordingTime)}</span>
              </div>
              <div className="recording-actions">
                <button 
                  type="button" 
                  className="cancel-recording-button"
                  onClick={cancelRecording}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="send-recording-button"
                  onClick={stopRecording}
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>
        {audioBlob && !isRecording && (
          <div className="audio-preview">
            <div className="audio-preview-controls">
              <button 
                type="button"
                onClick={() => toggleAudioPlayback('preview', URL.createObjectURL(audioBlob))}
                className="preview-play-button"
              >
                {currentAudioId === 'preview' ? <BsPauseFill /> : <BsFillPlayFill />}
              </button>
              <div className={`audio-waveform ${currentAudioId === 'preview' ? 'playing' : 'paused'}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="waveform-bar" style={{height: `${Math.random() * 20 + 10}px`}}></div>
                ))}
              </div>
              <span className="audio-duration">{formatTime(recordingTime)}</span>
            </div>
            <div className="audio-preview-actions">
              <button 
                type="button" 
                className="discard-audio-button"
                onClick={() => setAudioBlob(null)}
              >
                Discard
              </button>
              <button 
                type="button" 
                className="send-audio-button"
                onClick={sendAudioMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatDetail;

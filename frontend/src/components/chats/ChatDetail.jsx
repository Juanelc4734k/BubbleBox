import React, { useState, useEffect, useRef, useReducer, lazy, Suspense } from "react";
import io from "socket.io-client";
import "../../assets/css/chats/chatsDetails.css";
import { IoClose } from "react-icons/io5";
import { FaRegFaceSmileWink } from "react-icons/fa6";

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

  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);
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
        setMessages(data);

        const userResponse = await fetch(
          `http://localhost:3000/users/usuario/${chatId}`
        );
        const userData = await userResponse.json();
        console.log(userData);
        setFriendUser(userData);
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
        const newMessage = {
          id: message.id,
          sender_id: parseInt(message.senderId),
          receiver_id: parseInt(message.receiverId),
          message: message.message,
          created_at: message.created_at,
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

    return () => {
      socketRef.current?.off("message_sent_confirmation");
    };
  }, []);
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
            className={`message-bubble ${
              message.sender_id === parseInt(senderId) ? "sent" : "received"
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
          <button type="button" className="emoji-button" onClick={toggleEmojiPicker}>
            <FaRegFaceSmileWink />
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
        </div>
      </form>
    </div>
  );
};

export default ChatDetail;

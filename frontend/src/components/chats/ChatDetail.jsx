import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  lazy,
  Suspense,
} from "react";
import io from "socket.io-client";
import "../../assets/css/chats/chatsDetails.css";
import { IoClose } from "react-icons/io5";
import { FaRegFaceSmileWink } from "react-icons/fa6";
import { FaMicrophone, FaStop, FaEdit, FaTrash, FaBan } from "react-icons/fa";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { IoMdAttach, IoMdImage, IoMdDocument } from "react-icons/io";
import { FaRegPaperPlane } from "react-icons/fa";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const ChatDetail = ({ chatId, onMessageSent, onCloseChat }) => {
  const avatarDefault =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(avatarDefault);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [esPantallaChica, setEsPantallaChica] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEmojiPickerInitialized, setIsEmojiPickerInitialized] =
    useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [currentUserAvatar, setCurrentUserAvatar] = useState(avatarDefault);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAudioId, setCurrentAudioId] = useState(null);

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [fileUploadType, setFileUploadType] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const fileInputRef = useRef(null);

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
  useEffect(() => {
    const manejarResize = () => {
      setEsPantallaChica(window.innerWidth < 768); // Cambiá 768 según tu breakpoint
    };

    manejarResize(); // Para que se ejecute apenas carga

    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);

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

        setFriendUser(userData);
        setAvatarUrl(
          userData.avatar
            ? `http://localhost:3009${userData.avatar}`
            : avatarDefault
        );

        // Obtener el avatar del usuario actual
        const currentUserResponse = await fetch(
          `http://localhost:3000/users/usuario/${senderId}`
        );
        const currentUserData = await currentUserResponse.json();
        const currentUserAvatarUrl = currentUserData.avatar
          ? `http://localhost:3009${currentUserData.avatar}`
          : avatarDefault;
        setCurrentUserAvatar(currentUserAvatarUrl);

        // Create a Set to track message IDs we've already processed
        const processedMessageIds = new Set();

        const messagesWithAvatars = data.reduce((acc, msg) => {
          if (processedMessageIds.has(msg.id)) {
            return acc;
          }
          processedMessageIds.add(msg.id);

          const isAudioMessage =
            msg.audio_path || (msg.message === null && msg.audio_path);
          const isImageMessage = msg.image_path;
          const isDocumentMessage = msg.file_path;

          let imageUrl = null;
          let fileUrl = null;
          let audioUrl = null;

          if (isImageMessage) {
            imageUrl = msg.image_path.startsWith("http")
              ? msg.image_path
              : `http://localhost:3001${msg.image_path}`;
          }

          if (isDocumentMessage) {
            fileUrl = msg.file_path.startsWith("http")
              ? msg.file_path
              : `http://localhost:3001${msg.file_path}`;
          }

          if (isAudioMessage) {
            audioUrl = msg.audio_path
              ? msg.audio_path.startsWith("http")
                ? msg.audio_path
                : `http://localhost:3001${msg.audio_path}`
              : msg.audioUrl
              ? msg.audioUrl.startsWith("http")
                ? msg.audioUrl
                : `http://localhost:3001${msg.audioUrl}`
              : null;
          }

          const formattedMessage = {
            ...msg,
            message: isAudioMessage
              ? "audio_message"
              : isImageMessage
              ? "image_message"
              : isDocumentMessage
              ? "document_message"
              : msg.message,
            audio_url: audioUrl,
            image_url: imageUrl,
            file_url: fileUrl,
            file_name: msg.file_name,
            file_type: msg.file_type,
            duration: msg.duration || "0:00",
            avatar:
              msg.sender_id === parseInt(senderId)
                ? currentUserAvatarUrl
                : userData.avatar
                ? `http://localhost:3009${userData.avatar}`
                : avatarDefault,
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
      // Join chat room and set online status
      socketRef.current.emit("join_chat", {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
      });

      // Set our status as online
      socketRef.current.emit("user_online", {
        userId: parseInt(senderId),
        //status: "conectado"
      });

      // Fetch messages and initial status
      fetchInitialMessages();

      // Request other user's status after a short delay
      setTimeout(() => {
        socketRef.current.emit("request_user_status", {
          requesterId: parseInt(senderId),
          userId: parseInt(chatId),
        });
      }, 300);
    });

    socketRef.current.on("user_typing", (data) => {
      if (parseInt(data.userId) === parseInt(chatId)) {
        setIsTyping(true);

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    socketRef.current.on("user_online_status", (data) => {
      if (parseInt(data.userId) === parseInt(chatId)) {
        console.log(
          "Setting online status for user",
          chatId,
          "to",
          data.isOnline
        );
        setIsOnline(Boolean(data.isOnline));
        if (!data.isOnline && data.lastSeen) {
          setLastSeen(data.lastSeen);
        }
      }
    });

    socketRef.current.on("receive_private_message", (message) => {
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
          message: message.filePath ? "document_message" : message.message,
          file_url: message.filePath
            ? `http://localhost:3001${message.filePath}`
            : null,
          file_name: message.fileName,
          file_type: message.fileType,
          created_at: message.created_at,
          avatar: messageAvatar,
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
          chatId: parseInt(chatId),
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
        socketRef.current.emit("user_offline", {
          userId: parseInt(senderId),
          lastSeen: new Date().toISOString(),
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
      console.log(
        "Received status request from:",
        data.requesterId,
        "for user:",
        data.userId
      );

      // If someone is requesting our status, respond directly
      if (parseInt(data.userId) === parseInt(senderId)) {
        socketRef.current.emit("user_status_response", {
          responderId: parseInt(senderId),
          requesterId: parseInt(data.requesterId),
          isOnline: true,
        });
      }
    });

    // Handle direct status responses
    socketRef.current.on("user_status_response", (data) => {
      if (parseInt(data.responderId) === parseInt(chatId)) {
        console.log(
          "Setting online status from direct response for user",
          chatId
        );
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
      if (parseInt(data.userId) === parseInt(chatId)) {
        console.log(
          "Setting online status for user",
          chatId,
          "to",
          data.isOnline
        );
        // Ensure we're setting a boolean value
        setIsOnline(data.isOnline === true);
        forceUpdate(); // Force re-render

        // Only update lastSeen if user is actually offline
        if (data.isOnline !== true && data.lastSeen) {
          setLastSeen(data.lastSeen);
          forceUpdate(); // Force re-render
        }
      }
    };

    // Handle leave chat event
    const handleLeaveChat = (data) => {
      if (parseInt(data.userId) === parseInt(chatId)) {
        // Don't set as offline, just note they left the chat
      }
    };

    socketRef.current
      .off("user_online_status")
      .on("user_online_status", handleOnlineStatusEvent);
    socketRef.current.off("leave_chat").on("leave_chat", handleLeaveChat);

    return () => {
      socketRef.current?.off("user_online_status");
      socketRef.current?.off("leave_chat");
    };
  }, [chatId, forceUpdate]);
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current?.connected && e.target.value.trim() !== "") {
      socketRef.current.emit("user_typing", {
        senderId: parseInt(senderId),
        receiverId: parseInt(chatId),
        userId: parseInt(senderId), // Make sure userId is included
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
        senderAvatar: currentUserAvatar,
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
          avatar: currentUserAvatar,
        },
      ]);

      socketRef.current.emit("send_private_message", messageData);
      setNewMessage("");
      setShowEmojiPicker(false);

      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);

      // Automatically send the file after selection
      sendFileMessage(file);
    }
  };

  const triggerFileInput = (type) => {
    setFileUploadType(type);
    setShowAttachMenu(false);

    // Set a timeout to ensure the state is updated before clicking
    setTimeout(() => {
      fileInputRef.current.click();
    }, 100);
  };

  const sendFileMessage = async (file) => {
    if (!file || !socketRef.current?.connected) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const fileType = file.type.split("/")[0]; // 'image', 'application', etc.

      // Create FormData for sending the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", senderId);
      formData.append("receiverId", chatId);
      formData.append("temp_id", tempId);
      formData.append("senderAvatar", currentUserAvatar);

      // Add to pending messages
      setPendingMessages((prev) => new Set([...prev, tempId]));

      // Create temporary URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Add temporary message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender_id: parseInt(senderId),
          receiver_id: parseInt(chatId),
          message: fileType === "image" ? "image_message" : "document_message",
          file_url: fileUrl,
          file_type: fileType,
          file_name: file.name,
          created_at: new Date().toISOString(),
          pending: true,
          avatar: currentUserAvatar,
        },
      ]);

      // Send to server
      const response = await fetch("http://localhost:3001/chats/file-message", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      // Update the temporary message with the actual file data
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                file_url: `http://localhost:3001${responseData.filePath}`,
                file_name: responseData.fileName,
                file_type: responseData.fileType,
                pending: false,
              }
            : msg
        )
      );

      if (socketRef.current?.connected) {
        socketRef.current.emit("send_file_message", {
          senderId: parseInt(senderId),
          receiverId: parseInt(chatId),
          temp_id: tempId,
          filePath: responseData.filePath,
          fileType: responseData.fileType,
          fileName: responseData.fileName,
          id: responseData.id || responseData.messageId,
          created_at: new Date().toISOString(),
          senderAvatar: currentUserAvatar,
        });
      }

      // Reset file upload state
      setFileToUpload(null);
      setFileUploadType(null);

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

      if (typeof onMessageSent === "function") {
        // Use setTimeout to ensure UI updates before refreshing the chat list
        setTimeout(() => {
          onMessageSent();
        }, 500);
      }
    } catch (err) {
      console.error("Error sending file message:", err);
      setError("Error al enviar mensaje con archivo");
    }
  };

  // Formatear tiempo de grabación
  const formatTime = (seconds) => {
    if (typeof seconds !== "number" || isNaN(seconds) || !isFinite(seconds)) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        audioPlayerRef.current.addEventListener("loadedmetadata", () => {
          const duration = audioPlayerRef.current.duration;

          if (!isNaN(duration) && isFinite(duration)) {
            const formattedDuration = formatTime(duration);

            if (audioId !== "preview") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === audioId
                    ? { ...msg, duration: formattedDuration }
                    : msg
                )
              );
            }
          }
        });

        audioPlayerRef.current.addEventListener("error", (e) => {
          console.error("Audio playback error:", e);
          // Set a default duration if there's an error
          if (audioId !== "preview") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === audioId ? { ...msg, duration: "0:00" } : msg
              )
            );
          }
        });

        audioPlayerRef.current.play().catch((err) => {
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);

        // Liberar stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Iniciar grabación
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar temporizador
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("senderId", senderId);
      formData.append("receiverId", chatId);
      formData.append("temp_id", tempId);
      formData.append("duration", duration);
      formData.append("senderAvatar", currentUserAvatar);

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

      // Enviar al servidor
      const response = await fetch(
        "http://localhost:3001/chats/audio-message",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json();

      if (socketRef.current?.connected) {
        socketRef.current.emit("send_audio_message", {
          senderId: parseInt(senderId),
          receiverId: parseInt(chatId),
          temp_id: tempId,
          audioPath: responseData.audioPath || responseData.filePath,
          id: responseData.id || responseData.messageId,
          duration: duration,
          created_at: new Date().toISOString(),
          senderAvatar: currentUserAvatar,
        });
      }

      // Resetear blob de audio
      setAudioBlob(null);

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

      if (typeof onMessageSent === "function") {
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

  const deleteAllMessages = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar TODOS los mensajes de esta conversación? Esta acción no se puede deshacer."
      )
    ) {
      socketRef.current.emit("delete_all_messages", {
        userId1: parseInt(senderId),
        userId2: parseInt(chatId),
      });
    }
  };

  const blockUser = () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres bloquear a ${friendUser.nombre}? No podrán enviarte mensajes ni ver tu estado.`
      )
    ) {
      // Call the API to block the user
      fetch("http://localhost:3000/friendships/bloquear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario1: parseInt(senderId),
          id_usuario2: parseInt(chatId),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Check for mensaje property instead of success
          if (data.mensaje || data.id) {
            // Notify through socket
            socketRef.current.emit("user_blocked", {
              blockerId: parseInt(senderId),
              blockedId: parseInt(chatId),
            });

            alert(`Has bloqueado a ${friendUser.nombre}`);
            // Close the chat
            onCloseChat();
          } else {
            alert(
              "Error al bloquear usuario: " +
                (data.message || "Error desconocido")
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error al bloquear usuario");
        });
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

    socketRef.current.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id
            ? {
                ...msg,
                message: updatedMessage.message,
                edited: true,
                updated_at: updatedMessage.updated_at,
              }
            : msg
        )
      );
    });

    socketRef.current.on("message_deleted", (deletedMessage) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
    });

    socketRef.current.on("all_messages_deleted", (data) => {
      // Check if this event is for our chat
      if (
        (parseInt(data.userId1) === parseInt(senderId) &&
          parseInt(data.userId2) === parseInt(chatId)) ||
        (parseInt(data.userId1) === parseInt(chatId) &&
          parseInt(data.userId2) === parseInt(senderId))
      ) {
        // Clear all messages
        setMessages([]);
        alert(
          `Se han eliminado ${data.deletedCount} mensajes de esta conversación`
        );
      }
    });

    socketRef.current.on("user_blocked_notification", (data) => {
      // If we were blocked, show a message and close the chat
      if (parseInt(data.blockedId) === parseInt(senderId)) {
        alert(`Has sido bloqueado por ${friendUser.nombre}`);
        onCloseChat();
      }
    });

    // Fix: Move these handlers outside of the message_sent_confirmation handler
    socketRef.current.on("receive_audio_message", (message) => {
      setMessages((prev) => {
        const audioUrl = message.audioPath
          ? `http://localhost:3001${message.audioPath}`
          : message.audioUrl
          ? message.audioUrl.startsWith("http")
            ? message.audioUrl
            : `http://localhost:3001${message.audioUrl}`
          : null;

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
          avatar: messageAvatar,
        };

        if (
          message.temp_id &&
          parseInt(message.senderId) === parseInt(senderId)
        ) {
          return prev;
        }

        const messageExists = prev.some((m) => m.id === newMessage.id);

        if (!messageExists) {
          return [...prev, newMessage].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        }
        return prev;
      });
    });

    socketRef.current.on(
      "audio_message_sent_confirmation",
      ({ temp_id, id, audioPath }) => {
        console.log("Audio message confirmation received:", {
          temp_id,
          id,
          audioPath,
        });

        // Make sure we remove from pending messages
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(temp_id);
          return newSet;
        });

        // Update the message with the permanent ID and server URL
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === temp_id
              ? {
                  ...msg,
                  id,
                  pending: false,
                  audio_url: `http://localhost:3001${audioPath}`,
                }
              : msg
          );

          console.log(
            "Updated messages after confirmation:",
            updatedMessages.find((m) => m.id === id || m.id === temp_id)
          );

          return updatedMessages;
        });

        // Force a re-render to ensure UI updates
        forceUpdate();

        // Now it's safe to call onMessageSent
        if (typeof onMessageSent === "function") {
          setTimeout(() => {
            try {
              onMessageSent();
            } catch (error) {
              console.error("Error in onMessageSent callback:", error);
            }
          }, 500);
        }
      }
    );

    socketRef.current.on("receive_file_message", (message) => {
      setMessages((prev) => {
        let messageAvatar;
        if (parseInt(message.senderId) === parseInt(senderId)) {
          messageAvatar = message.senderAvatar || currentUserAvatar;
        } else {
          messageAvatar = message.senderAvatar || avatarUrl;
        }

        let fileUrl = message.filePath
          ? message.filePath.startsWith("http")
            ? message.filePath
            : `http://localhost:3001${message.filePath}`
          : message.file_url;

        const newMessage = {
          id: message.id,
          sender_id: parseInt(message.senderId),
          receiver_id: parseInt(message.receiverId),
          message:
            message.fileType === "image" ? "image_message" : "document_message",
          file_url: fileUrl,
          file_type: message.fileType,
          file_name: message.fileName,
          created_at: message.created_at,
          avatar: messageAvatar,
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
            (m.file_url &&
              m.file_url === newMessage.file_url &&
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

    socketRef.current.on(
      "file_message_sent_confirmation",
      ({ temp_id, id, filePath, fileType, fileName }) => {
        console.log("File message confirmation received:", {
          temp_id,
          id,
          filePath,
        });

        // Remove from pending messages
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(temp_id);
          return newSet;
        });

        // Update the message with the permanent ID and server URL
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === temp_id
              ? {
                  ...msg,
                  id,
                  pending: false,
                  file_url: `http://localhost:3001${filePath}`,
                }
              : msg
          );

          console.log(
            "Updated messages after file confirmation:",
            updatedMessages.find((m) => m.id === id || m.id === temp_id)
          );

          return updatedMessages;
        });

        // Force a re-render to ensure UI updates
        forceUpdate();
      }
    );

    return () => {
      socketRef.current?.off("message_sent_confirmation");
      socketRef.current?.off("receive_audio_message");
      socketRef.current?.off("audio_message_sent_confirmation");
      socketRef.current?.off("message_edited");
      socketRef.current?.off("message_deleted");
      socketRef.current?.off("all_messages_deleted");
      socketRef.current?.off("user_blocked_notification");
      socketRef.current?.off("receive_file_message");
    };
  }, [chatId, senderId, friendUser.nombre, onCloseChat]);

  const startEditingMessage = (message) => {
    // Check if the message is within the 15-minute edit window
    const messageTime = new Date(message.created_at);
    const currentTime = new Date();
    const timeDifference = (currentTime - messageTime) / (1000 * 60); // in minutes

    if (timeDifference > 15) {
      alert("No puedes editar mensajes después de 15 minutos");
      return;
    }

    setEditingMessageId(message.id);
    setEditMessageContent(message.message);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditMessageContent("");
  };

  const saveEditedMessage = () => {
    if (!editMessageContent.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("edit_message", {
      messageId: editingMessageId,
      senderId: parseInt(senderId),
      newContent: editMessageContent.trim(),
    });

    setEditingMessageId(null);
    setEditMessageContent("");
  };

  const deleteMessage = (messageId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      socketRef.current.emit("delete_message", {
        messageId,
        senderId: parseInt(senderId),
      });
    }
  };

  // Renderizar contenido del mensaje según su tipo
  const renderMessageContent = (message) => {
    if (editingMessageId === message.id) {
      return (
        <div className="edit-message-container">
          <textarea
            value={editMessageContent}
            onChange={(e) => setEditMessageContent(e.target.value)}
            className="edit-message-input"
            spellCheck={false}
            autoFocus
            rows={Math.min(
              4,
              (editMessageContent.match(/\n/g) || []).length + 1
            )}
          />
          <div className="edit-message-actions">
            <button
              onClick={cancelEditingMessage}
              className="cancel-edit-button"
            >
              <span className="button-icon">✕</span>
              <span className="button-text">Cancel</span>
            </button>
            <button
              onClick={saveEditedMessage}
              className="save-edit-button"
              disabled={!editMessageContent.trim()}
            >
              <span className="button-icon">✓</span>
              <span className="button-text">Save</span>
            </button>
          </div>
        </div>
      );
    } else if (message.message === "audio_message") {
      const isPlaying = currentAudioId === message.id;

      return (
        <div className="audio-message">
          <button
            className="audio-control-button"
            onClick={() => toggleAudioPlayback(message.id, message.audio_url)}
          >
            {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
          </button>
          <div className={`audio-waveform ${isPlaying ? "playing" : "paused"}`}>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
          </div>
          <span className="audio-duration">{message.duration || "0:00"}</span>
          {message.pending && (
            <span className="text-xs opacity-70 ml-2">Sending...</span>
          )}
        </div>
      );
    } else if (message.message === "image_message") {
      return (
        <div className="image-message">
          <div className="image-container">
            <img
              src={message.file_url}
              alt="Shared image"
              className="shared-image"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x300?text=Error+al+cargar+imagen";
              }}
              onClick={() => window.open(message.file_url, "_blank")}
            />
            {message.pending && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <span>Enviando...</span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (message.message === "document_message") {
      return (
        <div className="file-message">
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-download-link"
          >
            <div className="file-icon">
              <IoMdDocument />
            </div>
            <div className="file-info">
              <span className="file-name">{message.file_name}</span>
              <span className="file-type">{message.file_type}</span>
            </div>
          </a>
          {message.pending && (
            <span className="text-xs opacity-70 ml-2">Sending...</span>
          )}
        </div>
      );
    } else {
      // Mensaje de texto normal
      return (
        <div className="message-content-wrapper">
          <span>
            {message.message}
            {message.edited && (
              <span className="edited-indicator"> (editado)</span>
            )}
          </span>
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

          <h2 className="textChatH">
          {friendUser && friendUser.nombre
        ? esPantallaChica
          ? friendUser.nombre.length > 8
            ? `${friendUser.nombre.substring(0, 8)}...`
            : friendUser.nombre
          : friendUser.nombre
        : ""}
            </h2>
          <div className="user-status">
            {isTyping ? (
              <span className="typing-status">Escribiendo</span>
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
        <div className="chat-actions">
          <button
            onClick={deleteAllMessages}
            className="delete-all-messages-button"
            title="Eliminar todos los mensajes"
          >
            <FaTrash />
          </button>
          <button
            onClick={blockUser}
            className="block-user-button"
            title="Bloquear usuario"
          >
            <FaBan />
          </button>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-container ${
              message.sender_id === parseInt(senderId)
                ? "sent-container"
                : "received-container"
            }`}
          >
            {message.sender_id !== parseInt(senderId) && (
              <img
                src={message.avatar || avatarUrl}
                alt="User avatar"
                className="message-avatar sender-avatar"
                onError={(e) => (e.target.src = avatarDefault)}
              />
            )}
            <div
              className={`message-bubble ${
                message.sender_id === parseInt(senderId) ? "sent" : "received"
              }`}
            >
              {renderMessageContent(message)}
            </div>
            {/* Add message actions for own messages */}
            {message.sender_id === parseInt(senderId) &&
              message.message !== "audio_message" &&
              message.message !== "document_message" &&
              message.message !== "image_message" &&
              editingMessageId !== message.id && (
                <div className="message-actions">
                  <button
                    onClick={() => startEditingMessage(message)}
                    className="edit-message-button"
                    title="Edit message"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="delete-message-button"
                    title="Delete message"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              )}
            {message.sender_id === parseInt(senderId) && (
              <img
                src={message.avatar || currentUserAvatar}
                alt="My avatar"
                className="message-avatar receiver-avatar"
                onError={(e) => (e.target.src = avatarDefault)}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="chatinput">
          {!isRecording ? (
            <>
              <button
                type="button"
                className="emoji-button"
                onClick={toggleEmojiPicker}
              >
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
                <div
                  className={`emoji-picker-container ${
                    showEmojiPicker ? "visible" : "hidden"
                  }`}
                >
                  <Suspense
                    fallback={
                      <div className="loading-emoji">Cargando emojis...</div>
                    }
                  >
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
                spellCheck={false}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="chat-input"
              />
              {/* Attachment menu */}
              {/* Add attachment button here */}
              <button
                type="button"
                className="attach-button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <IoMdAttach />
              </button>

              {/* Attachment menu */}
              {showAttachMenu && (
                <div className="attach-menu">
                  <button
                    type="button"
                    onClick={() => triggerFileInput("image")}
                    className="attach-option"
                  >
                    <IoMdImage /> Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFileInput("document")}
                    className="attach-option"
                  >
                    <IoMdDocument /> Documento
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="send-button"
              >
                <FaRegPaperPlane />
              </button>
            </>
          ) : (
            <div className="recording-container">
              <div className="recording-indicator">
                <FaStop
                  onClick={stopRecording}
                  className="stop-recording-button"
                />
                <span className="recording-time">
                  {formatTime(recordingTime)}
                </span>
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
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          accept={fileUploadType === "image" ? "image/*" : "*"}
        />
        {audioBlob && !isRecording && (
          <div className="audio-preview">
            <div className="audio-preview-controls">
              <button
                type="button"
                onClick={() =>
                  toggleAudioPlayback("preview", URL.createObjectURL(audioBlob))
                }
                className="preview-play-button"
              >
                {currentAudioId === "preview" ? (
                  <BsPauseFill />
                ) : (
                  <BsFillPlayFill />
                )}
              </button>
              <div
                className={`audio-waveform ${
                  currentAudioId === "preview" ? "playing" : "paused"
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="waveform-bar"
                    style={{ height: `${Math.random() * 20 + 10}px` }}
                  ></div>
                ))}
              </div>
              <span className="audio-duration">
                {formatTime(recordingTime)}
              </span>
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

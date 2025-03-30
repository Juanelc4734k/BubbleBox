import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatPreview from "./ChatPreview";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { getFriends } from "../../services/friends";
import { FaSearch } from "react-icons/fa"; // Import search icon
import "../../assets/css/chats/SideChat.css";

const SidebarChat = ({ onSelectChat }) => {
  const [friendsSidebar, setFriendsSidebar] = useState([]);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
  const [errorSidebar, setErrorSidebar] = useState(null);
  const [isSidebarVisibleChatPage, setIsSidebarVisibleChatPage] =
    useState(false);
  const [animateEntry, setAnimateEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Add search state
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Pantallas grandes (ajusta el tamaño si lo necesitas)
        setIsSidebarVisibleChatPage(true); // Siempre visible en pantallas grandes
      }
    };
    // Ejecutar la función al cargar y cuando se cambie el tamaño de la pantalla
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleCommentsSidebarClosed = () => {
      setAnimateEntry(true);
      setTimeout(() => setAnimateEntry(false), 1000); // Reset after animation completes
    };

    document.addEventListener(
      "commentsSidebarClosed",
      handleCommentsSidebarClosed
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener(
        "commentsSidebarClosed",
        handleCommentsSidebarClosed
      );
    };
  }, []);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setIsLoadingSidebar(true);
        const friendsList = await getFriends(userId);

        const friendsWithLastMessage = await Promise.all(
          friendsList.map(async (friend) => {
            const friendId =
              friend.id_usuario1 === parseInt(userId)
                ? friend.id_usuario2
                : friend.id_usuario1;

            try {
              const response = await fetch(
                `http://localhost:3001/chats/messages/${userId}/${friendId}`
              );
              const messages = await response.json();
              const lastMessage = messages[messages.length - 1]?.message || "";
              return { ...friend, lastMessage };
            } catch (error) {
              return { ...friend, lastMessage: "" };
            }
          })
        );

        setFriendsSidebar(friendsWithLastMessage);
        setErrorSidebar(null);
      } catch (error) {
        console.error("Error al obtener los amigos:", error);
        setErrorSidebar("No tienes amigos agregados aún");
      } finally {
        setIsLoadingSidebar(false);
      }
    };
    loadFriends();
  }, [userId]);

  // Filter friends based on search term
  // Add this useEffect to log the actual structure of a friend object
  useEffect(() => {
    if (friendsSidebar.length > 0) {
    }
  }, [friendsSidebar]);

  // Then update the filtering logic
  const filteredFriends = friendsSidebar.filter((friend) => {
    if (!friend) return false;

    // Log each friend when searching to debug
    if (searchTerm) {
    }

    // Get the correct name based on userId
    const friendName =
      friend.id_usuario1 === parseInt(userId)
        ? friend.nombre_usuario2
        : friend.nombre_usuario1;

    // Create searchable text from friend name and last message
    const searchableText = friendName.toLowerCase();
    const lastMsg = friend.lastMessage || "";
    const fullSearchText = searchableText + " " + lastMsg.toLowerCase();

    // Check if search term is in the combined text
    return fullSearchText.includes(searchTerm.toLowerCase());
  });

  // Debug - log the filtered results
  useEffect(() => {}, [searchTerm, filteredFriends]);
  return (
    <div
      className={`sidebar-wrapper-Page ${
        isSidebarVisibleChatPage || window.innerWidth >= 1024
          ? "open"
          : "closed"
      } ${animateEntry ? "animate-entry" : ""}`}
    >
      <button
        className="buttonOpenSidebarp"
        onClick={() => setIsSidebarVisibleChatPage(!isSidebarVisibleChatPage)}
      >
        {isSidebarVisibleChatPage ? <IoIosArrowForward /> : <IoIosArrowBack />}
      </button>
      <div className="sidebar-chats-Page">
        <div className="chats-container-Page">
          {isLoadingSidebar ? (
            <div className="p-4 text-center text-gray-600 backdrop-blur-md divTextChat ">
              <p>Cargando chats...</p>
            </div>
          ) : errorSidebar ? (
            <div className="p-4 text-center text-gray-600 backdrop-blur-md divTextChat">
              <p>{errorSidebar}</p>
              <p className="mt-2 text-sm">
                ¡Agrega amigos para comenzar a chatear!
              </p>
            </div>
          ) : (
            <div className="chatssDetailPage">
              <div className="hederChatPage">
                <h2 className="textChatPage">Tus Chats</h2>
              </div>

              {/* Search input */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar chat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="chat-list-Page">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <ChatPreview
                      key={friend.id_usuario1 + "-" + friend.id_usuario2}
                      friend={friend}
                      onSelect={() => {
                        const friendId =
                          friend.id_usuario1 === Number.parseInt(userId)
                            ? friend.id_usuario2
                            : friend.id_usuario1;
                        // Navigate with state containing the friend ID
                        navigate(`/chats`, {
                          state: { selectedFriendId: friendId },
                        });
                      }}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-600">
                    <p>No se encontraron chats</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarChat;

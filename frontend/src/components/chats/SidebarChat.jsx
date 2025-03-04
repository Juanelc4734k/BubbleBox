import React, { useState, useEffect } from 'react';
import ChatPreview from './ChatPreview';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { getFriends } from '../../services/friends';
import "../../assets/css/chats/SideChat.css";

const SidebarChat = ({onSelectChat}) => {
    const [friendsSidebar, setFriendsSidebar] = useState([]);
    const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
    const [errorSidebar, setErrorSidebar] = useState(null);
    const [isSidebarVisibleChatPage, setIsSidebarVisibleChatPage] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // Pantallas grandes (ajusta el tamaño si lo necesitas)
                setIsSidebarVisibleChatPage(true); // Siempre visible en pantallas grandes
            }
        };
        // Ejecutar la función al cargar y cuando se cambie el tamaño de la pantalla
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    useEffect(() => {
        const loadFriends = async () => {
            try {
                setIsLoadingSidebar(true);
                const friendsList = await getFriends(userId);
                console.log("Lista de amigos obtenida:", friendsList);
                
                const friendsWithLastMessage = await Promise.all(
                    friendsList.map(async (friend) => {
                        const friendId = friend.id_usuario1 === parseInt(userId) 
                            ? friend.id_usuario2 
                            : friend.id_usuario1;
                        
                        try {
                            const response = await fetch(`http://localhost:3001/chats/messages/${userId}/${friendId}`);
                            const messages = await response.json();
                            const lastMessage = messages[messages.length - 1]?.message || '';
                            return { ...friend, lastMessage };
                        } catch (error) {
                            return { ...friend, lastMessage: '' };
                        }
                    })
                );
                
                setFriendsSidebar(friendsWithLastMessage);
                setErrorSidebar(null);
            } catch (error) {
                console.error('Error al obtener los amigos:', error);
                setErrorSidebar('No tienes amigos agregados aún');
            } finally {
                setIsLoadingSidebar(false);
            }
        };
        loadFriends();
    }, [userId]);
    return (
        <div className={`sidebar-wrapper-Page ${isSidebarVisibleChatPage || window.innerWidth >= 1024 ? "open" : "closed"}`}>
            <button className="buttonOpenSidebarp" onClick={() => setIsSidebarVisibleChatPage(!isSidebarVisibleChatPage)}>
                {isSidebarVisibleChatPage ? <IoIosArrowForward /> : <IoIosArrowBack />}
            </button>
            <div className="sidebar-chats-Page">
                <div className="chats-container-Page">
                    {isLoadingSidebar ? (
                        <div className="p-4 text-center text-gray-600 backdrop-blur-md">
                            <p>Cargando chats...</p>
                        </div>
                    ) : errorSidebar ? (
                        <div className="p-4 text-center text-gray-600 backdrop-blur-md">
                            <p>{errorSidebar}</p>
                            <p className="mt-2 text-sm">¡Agrega amigos para comenzar a chatear!</p>
                        </div>
                    ) : (
                        <div className="chatssDetailPage">
                            <div className="hederChatPage">
                                <h2 className="textChatPage">Tus Chats</h2>  
                            </div>
                            <div className="chat-list-Page">
                                {friendsSidebar.map((friend) => (
                                    <ChatPreview
                                        key={friend.id_usuario1 + "-" + friend.id_usuario2}
                                        friend={friend}
                                        onSelect={() => {
                                            const friendId = friend.id_usuario1 === Number.parseInt(userId) ? friend.id_usuario2 : friend.id_usuario1;
                                            onSelectChat(friendId);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarChat;
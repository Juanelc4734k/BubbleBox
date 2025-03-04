import React, { useState, useEffect } from 'react'
import ChatPreview from '../components/chats/ChatPreview'
import ChatDetail from '../components/chats/ChatDetail'
import { getFriends } from '../services/friends'
import '../assets/css/layout/sidebarChats.css'
import { CgChevronLeftO, CgChevronRightO  } from "react-icons/cg";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";
import CreateGroup from '../components/chats/CreateGroup';


const Chats = ({isCreateGroupOpen, setIsCreateGroupOpen}) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarVisibleChat, setIsSidebarVisibleChat] = useState(true);
    const userId = localStorage.getItem('userId');

    const handleCloseChat = () => {
        setSelectedFriend(null);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // Pantallas grandes (ajusta el tamaño si lo necesitas)
                setIsSidebarVisibleChat(true); // Siempre visible en pantallas grandes
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
        if (selectedFriend) {
            const timer = setTimeout(() => {
                setIsSidebarVisibleChat(false);
            }, 1000); 
    
            return () => clearTimeout(timer); // Limpia el temporizador si el usuario cambia de chat antes de que termine el tiempo
        }
    }, [selectedFriend]);
    
    useEffect(() => {
        const loadFriends = async () => {
            try {
                setIsLoading(true);
                const friendsList = await getFriends(userId);
                
                // Fetch last message for each friend
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
                
                setFriends(friendsWithLastMessage);
                setError(null);
            } catch (error) {
                console.error('Error al obtener los amigos:', error);
                setError('No tienes amigos agregados aún');
            } finally {
                setIsLoading(false);
            }
        };
        loadFriends();
    }, [userId]);

    return (
        <div className='conSide'>   
            <div className='dideChat'>
                {selectedFriend ? (
                    <ChatDetail 
                        chatId={selectedFriend} 
                        onMessageSent={() => {
                            loadFriends();
                        }}
                        onCloseChat={handleCloseChat}
                    />
                ) : (
                    <div className="selectChat">
                        Selecciona un chat para comenzar
                    </div>
                )}
            </div>
            <div className={`sidebar-wrapper ${isSidebarVisibleChat || window.innerWidth >= 1024 ? "open" : "closed"}`}>
                <button className="buttonOpenS" onClick={() => setIsSidebarVisibleChat(!isSidebarVisibleChat)}>
                {isSidebarVisibleChat ? <IoIosArrowForward /> : <IoIosArrowBack />}
                </button>
                <div className="sidebar-chats">
                    <div className="chats-container">
                        {isLoading ? (
                        <div className="p-4 text-center text-gray-600 backdrop-blur-md">
                            <p>Cargando chats...</p>
                        </div>
                        ) : error ? (
                        <div className="p-4 text-center text-gray-600 backdrop-blur-md">
                            <p>{error}</p>
                            <p className="mt-2 text-sm">¡Agrega amigos para comenzar a chatear!</p>
                        </div>
                        ) : (
                        <div className="chatssDetail">
                            <div className="hederChat">
                                <h2 className="textChat">Tus Chats</h2>  
                                {(isSidebarVisibleChat || window.innerWidth >= 1024) && (
                                    <CreateGroup isCreateGroupOpen={isCreateGroupOpen} setIsCreateGroupOpen={setIsCreateGroupOpen}/>
                                )} 
                            </div>
                            <div className="chat-list">
                                {friends.map((friend) => (
                                <ChatPreview
                                    key={friend.id_usuario1 + "-" + friend.id_usuario2}
                                    friend={friend}
                                    onSelect={() => {
                                    const currentUserId = localStorage.getItem("userId")
                                    const friendId =
                                        friend.id_usuario1 === Number.parseInt(currentUserId) ? friend.id_usuario2 : friend.id_usuario1
                                    setSelectedFriend(friendId)
                                    }}
                                    isSelected={
                                    selectedFriend ===
                                    (friend.id_usuario1 === Number.parseInt(userId) ? friend.id_usuario2 : friend.id_usuario1)
                                    }
                                />
                                ))}
                            </div>
                            
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chats;
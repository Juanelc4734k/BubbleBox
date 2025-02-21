import React, { useState, useEffect } from 'react'
import ChatPreview from '../components/chats/ChatPreview'
import ChatDetail from '../components/chats/ChatDetail'
import { getFriends } from '../services/friends'

const Chats = () => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    
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
        <div className='flex h-screen pt-16'>
            <div className='w-1/3 border-r'>
                {isLoading ? (
                    <div className="p-4 text-center text-gray-600">
                        <p>Cargando chats...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-gray-600">
                        <p>{error}</p>
                        <p className="mt-2 text-sm">¡Agrega amigos para comenzar a chatear!</p>
                    </div>
                ) : (
                    friends.map(friend => (
                        <ChatPreview 
                            key={friend.id_usuario1 + '-' + friend.id_usuario2} 
                            friend={friend} 
                            onSelect={() => {
                                const currentUserId = localStorage.getItem('userId');
                                const friendId = friend.id_usuario1 === parseInt(currentUserId) 
                                    ? friend.id_usuario2 
                                    : friend.id_usuario1;
                                setSelectedFriend(friendId);
                            }} 
                            isSelected={selectedFriend === (friend.id_usuario1 === parseInt(userId) 
                                ? friend.id_usuario2 
                                : friend.id_usuario1)}
                        />
                    ))
                )}
            </div>
            <div className='w-2/3'>
                {selectedFriend ? (
                    <ChatDetail 
                        chatId={selectedFriend} 
                        onMessageSent={() => {
                            // Refresh friends list to update last messages
                            loadFriends();
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Selecciona un chat para comenzar
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chats;
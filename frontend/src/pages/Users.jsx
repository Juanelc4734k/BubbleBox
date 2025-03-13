import React, { useEffect, useState } from 'react';
import User from '../components/users/User';
import { getUsers } from '../services/users';
import { getFriends, getFriendsBlocked, getRequestEarring, getFriendsInComun } from '../services/friends';
import '../assets/css/user/user.css';

function Users() {
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const loggedInUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all users for the "all" tab
                if (activeTab === 'all') {
                    const fetchedUsers = await getUsers();
                    console.log('Todos los usuarios:', fetchedUsers);
                    
                    const filteredUsers = fetchedUsers.filter(user => {
                        console.log(`Usuario ${user.id}:`, user);
                        return user && 
                               user.id !== parseInt(loggedInUserId) &&
                               user.rol !== 'administrador';
                    });
                    console.log('Usuarios filtrados:', filteredUsers);
                    setUsers(filteredUsers);
                }
                
                // Fetch friends for the "friends" tab
                if (activeTab === 'friends') {
                    const friendsData = await getFriends(loggedInUserId);
                    console.log('Amigos:', friendsData);
                    setFriends(friendsData);
                }
                
                // Fetch blocked users for the "blocked" tab
                if (activeTab === 'blocked') {
                    const blockedData = await getFriendsBlocked(loggedInUserId);
                    console.log('Usuarios bloqueados:', blockedData);
                    setBlockedUsers(blockedData);
                }
                
                // Fetch pending requests for the "requests" tab
                if (activeTab === 'requests') {
                    const pendingData = await getRequestEarring(loggedInUserId);
                    console.log('Solicitudes pendientes:', pendingData);
                    setPendingRequests(pendingData);
                }
                
            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        };
        
        fetchData();
    }, [activeTab, loggedInUserId]);

    // Get the appropriate list based on active tab
    const getDisplayUsers = () => {
        switch(activeTab) {
            case 'friends':
                return friends;
            case 'blocked':
                return blockedUsers;
            case 'requests':
                return pendingRequests;
            case 'all':
            default:
                return users;
        }
    };

    const displayUsers = getDisplayUsers();

    return (
        <>
            {/* Tab Navigation similar to Home.jsx */}
            <div className="tabs-container-2">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todos los Usuarios
                    </button>
                    <button 
                        className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        Mis Amigos
                    </button>
                    <button 
                        className={`tab ${activeTab === 'blocked' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blocked')}
                    >
                        Bloqueados
                    </button>
                    <button 
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Solicitudes Pendientes
                    </button>
                </div>
            </div>

            <div className='container-usuarios'>
                {displayUsers && displayUsers.length > 0 ? (
                    displayUsers.map((user) => (
                        <div key={user.id || `${user.id_usuario1}-${user.id_usuario2}`}>
                            <User 
                                user={user} 
                                tabType={activeTab} 
                            />
                        </div>
                    ))
                ) : (
                    <div className="empty-state-container">
                        <div className="empty-state-icon">
                            {activeTab === 'friends' ? '👥' : 
                            activeTab === 'blocked' ? '🚫' : 
                            activeTab === 'requests' ? '✉️' : 
                            '🔍'}
                        </div>
                        <p className="empty-state-message">
                            {activeTab === 'friends' ? 'No tienes amigos para mostrar.' :
                            activeTab === 'blocked' ? 'No hay usuarios bloqueados.' :
                            activeTab === 'requests' ? 'No hay solicitudes pendientes.' :
                            'No hay usuarios para mostrar.'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Users;
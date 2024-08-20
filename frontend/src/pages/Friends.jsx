import React, { useEffect, useState } from 'react';
import { getFriends } from '../services/friends';
import Friend from '../components/friendships/Friend';
import * as jwt_decode from 'jwt-decode';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const decoded = jwt_decode.jwtDecode(token);
            return decoded.userId;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchFriends = async () => {
            setIsLoading(true);
            try {
                const userId = getUserIdFromToken();
                if (!userId) {
                    setError('No se encontró el ID del usuario. Por favor, inicie sesión nuevamente.');
                    return;
                }
                const fetchedFriends = await getFriends(userId);
                setFriends(fetchedFriends);
            } catch (error) {
                console.error('Error al obtener los amigos:', error);
                setError('Ocurrió un error al cargar los amigos. Por favor, intenta de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchFriends();
    }, []);

    if (isLoading) {
        return <div>Cargando amigos...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {friends.length === 0 ? (
                <p>No tienes amigos aún. ¡Comienza a conectarte!</p>
            ) : (
                friends.map((friend) => (
                    <Friend 
                      key={friend.id_usuario2 || friend.id} 
                      friend={{
                        id_usuario2: friend.id_usuario2 || friend.id,
                        nombre_usuario2: friend.nombre_usuario2 || friend.nombre,
                        avatar_usuario2: friend.avatar_usuario2 || friend.avatar
                      }}
                    />
                  ))
            )}
        </div>
    );
};

export default Friends;
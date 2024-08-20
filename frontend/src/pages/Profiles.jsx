import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, getProfiles } from '../services/users';
import Profile from '../components/profile/Profile';
import * as jwt_decode from 'jwt-decode';

function Profiles() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                let fetchedProfile;
                const token = localStorage.getItem('token');
                const decoded = jwt_decode.jwtDecode(token);
                const loggedInUserId = decoded.userId;

                if (userId && userId !== loggedInUserId.toString()) {
                    // Si hay un userId en la URL y no es el usuario logueado, obtener perfil público
                    fetchedProfile = await getUserProfile(userId);
                } else {
                    // Si no hay userId o es el usuario logueado, obtener perfil completo
                    fetchedProfile = await getProfiles();
                }
                setProfile(fetchedProfile);
            } catch (err) {
                console.error('Error al obtener el perfil:', err);
                setError('Error al cargar el perfil');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (isLoading) return <div>Cargando perfil...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Perfil</h2>
            {profile ? (
                <Profile profile={profile} />
            ) : (
                <p>No se encontró el perfil.</p>
            )}
        </div>
    );
}

export default Profiles;
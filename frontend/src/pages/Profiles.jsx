import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, getProfiles } from '../services/users';
import Profile from '../components/profile/Profile';
import * as jwt_decode from 'jwt-decode';

function Profiles() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                let fetchedProfile;
                const token = localStorage.getItem('token');
                const decoded = jwt_decode.jwtDecode(token);
                const loggedInUserId = decoded.userId;

                // Determine if this is the user's own profile
                const isOwn = !userId || userId === loggedInUserId.toString();
                setIsOwnProfile(isOwn);

                if (!isOwn) {
                    fetchedProfile = await getUserProfile(userId);
                } else {
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
            {profile ? (
                <Profile profile={profile} isOwnProfile={isOwnProfile} />
            ) : (
                <p>No se encontró el perfil.</p>
            )}
        </div>
    );
}

export default Profiles;
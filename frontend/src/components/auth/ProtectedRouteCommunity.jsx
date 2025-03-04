import { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getCommunityById, isMember } from '../../services/comunity';
import Swal from 'sweetalert2';

const ProtectedRouteCommunity = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [canAccess, setCanAccess] = useState(false);
    const { id } = useParams();
    const userId = parseInt(localStorage.getItem('userId'));

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const community = await getCommunityById(id);
                if (community.tipo_privacidad === 'publica') {
                    setCanAccess(true);
                } else {
                    const response = await isMember(id, userId);
                    console.log('Member status:', response); // Debug log
                    setCanAccess(response === true || response?.esMiembro === true);
                }
            } catch (error) {
                console.error('Error checking community access:', error);
                setCanAccess(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de acceso',
                    text: 'No tienes permiso para acceder a esta comunidad privada',
                });
            } finally {
                setLoading(false);
            }
        };

        if (id && userId) {
            checkAccess();
        }
    }, [id, userId]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!canAccess) {
        return <Navigate to="/comunidades" replace />;
    }

    return children;
};

export default ProtectedRouteCommunity;
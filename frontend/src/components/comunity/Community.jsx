import { useEffect, useState } from 'react';
import { getCommunities, joinCommunity, leaveCommunity, isMember } from '../../services/comunity';
import { getUsers } from '../../services/users';
import '../../assets/css/comunity/community.css';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { use } from 'react';

const Community = () => {
    const avatarUsuario = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const parrafoComm =" Únete a una comunidad";
    const [mostrarT, setMostrarT] = useState(true);
    const [noVer, setNoVer] = useState(false);
    const [textoM, setTextoM] = useState("");
    const [communities, setCommunities] = useState([]);
    const [users, setUsers] = useState([]);
    const [membershipStatus, setMembershipStatus] = useState({}); // [communityId: boolean
    const userId = parseInt(localStorage.getItem('userId'));
    const navigate = useNavigate();


    useEffect(() => {
        const timer = setTimeout(() => {
            setMostrarT(false);
            setTimeout(() => setNoVer(true), 1500);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        let i = 0;
        const escribir = setInterval(() => {
          if (i <= parrafoComm.length) {
            setTextoM(parrafoComm.substring(0, i));
            i++;
          } else {
            clearInterval(escribir);
          }
        }, 100);
        
        return () => clearInterval(escribir);
    }, []);

    useEffect(() => {
        const fetchMembershipStatus = async (communities) => {
            const statusPromises = communities.map(async (community) => {
                const status = await isMember(community.id, userId);
                return { [community.id]: status };
            });
            const statuses = await Promise.all(statusPromises);
            setMembershipStatus(Object.assign({}, ...statuses));
        };

        getCommunities()
            .then(fetchedCommunities => {
                // Sort communities by date, newest first
                const sortedCommunities = fetchedCommunities.sort((a, b) => 
                    new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
                );
                setCommunities(sortedCommunities);
                fetchMembershipStatus(sortedCommunities);
            });
        getUsers().then(setUsers);
    }, [userId]);

    const handleMembership = async (e, communityId) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (membershipStatus[communityId]) {
                await leaveCommunity(communityId, userId);
                setMembershipStatus(prev => ({ ...prev, [communityId]: false}));
                Swal.fire({
                    icon: 'success',
                    title: 'Has dejado la comunidad',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await joinCommunity(communityId, userId);
                setMembershipStatus(prev => ({...prev, [communityId]: true}));
                Swal.fire({
                    icon:'success',
                    title: 'Te has unido la comunidad',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }   
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al unirse o dejar la comunidad.',
            });
        }
    }

    const handleCommunityClick = (e, community) => {
        if (community.tipo_privacidad === 'privada' && !membershipStatus[community.id]) {
            e.preventDefault();
            Swal.fire({
                icon: 'info',
                title: 'Comunidad Privada',
                text: 'Esta comunidad es privada. Debes unirte para ver su contenido.',
                showCancelButton: true,
                confirmButtonText: 'Unirme',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    handleMembership(e, community.id);
                    navigate(`/comunidad/${community.id}`);
                }
            });
        } else {
            navigate(`/comunidad/${community.id}`);
        }
    }

    return (
        <div className="community-Conten">
            <div className='textOcul'>
                {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
            </div>

            <div className='communitys'>
                {communities.map((community) => {
                    const creador = users.find(user => user.id === community.id_creador);
                    return (

                        <Link

                        to={`/comunidad/${community.id}`}
                        key={community.id}
                        className='communitys-Info'
                        onClick={(e) => handleCommunityClick(e, community)}
                        style={{ backgroundImage: `url(http://localhost:3004/uploads/${community.imagen})` }}>


                            <div className="datosOne">
                                <div className="datostwo">
                                    <div className="datoIcon">
                                        {creador && (
                                            <img 
                                                src={creador.avatar ? `http://localhost:3009${creador.avatar}` : avatarUsuario}
                                                alt={`${creador.nombre}'s avatar`}
                                                className="avatar-image"
                                            />
                                        )}
                                    </div>

                                    <div className="infouser">
                                        <h3>{community.nombre}</h3>
                                        <p className='fechacreate'>
                                            {community.fecha_creacion ? new Date(community.fecha_creacion).toLocaleString() : 'Fecha desconocida'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                type="button"
                                onClick={(e) => handleMembership(e, community.id)}
                                className={membershipStatus [community.id] ? 'leave-btn' : 'join-btn'}>
                                   {membershipStatus [community.id]? 'Dejar' : 'Unirse'}
                                </button>
                            </div>

                            <div className="infoCommunity">
                                <p>{community.descripcion}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Community;

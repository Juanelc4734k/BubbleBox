import { useEffect, useState, useRef } from 'react';
import { getCommunities, joinCommunity, leaveCommunity, isMember, updateCommunity, deleteCommunity } from '../../services/comunity';
import { getUsers } from '../../services/users';
import '../../assets/css/comunity/community.css';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiMoreVertical, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { IoClose } from 'react-icons/io5';

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
    const [activeTab, setActiveTab] = useState('all'); // New state for active tab
    const [showOptionsMenu, setShowOptionsMenu] = useState(null); // Track which community has open menu
    
    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_privacidad: 'publica',
        imagen: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [editMessage, setEditMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const editModalRef = useRef(null);

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

        // Find the community
        const community = communities.find(c => c.id === communityId);
        
        // Prevent creator from leaving their own community
        if (community && community.id_creador === userId && membershipStatus[communityId]) {
            Swal.fire({
                icon: 'info',
                title: 'No puedes dejar tu propia comunidad',
                text: 'Como creador, no puedes abandonar esta comunidad.',
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

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
    // Filter communities based on active tab
    const filteredCommunities = activeTab === 'my' 
        ? communities.filter(community => community.id_creador === userId)
        : activeTab === 'joined' 
        ? communities.filter(community => membershipStatus[community.id] && community.id_creador !== userId)
        : communities;
        const handleDeleteCommunity = async (e, communityId) => {
            e.preventDefault();
            e.stopPropagation();
            
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esta acción!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#b685e4',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                backdrop: `rgba(0,0,0,0.5)`,
                allowOutsideClick: false,
                zIndex: 10000
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await deleteCommunity(communityId);
                        
                        Swal.fire({
                            title: '¡Eliminado!',
                            text: 'Tu comunidad ha sido eliminada.',
                            icon: 'success',
                            confirmButtonColor: '#b685e4',
                            backdrop: `rgba(0,0,0,0.5)`,
                            allowOutsideClick: false,
                        }).then(() => {
                            window.location.reload();
                        });
                    } catch (error) {
                        console.error('Error al eliminar la comunidad:', error);
                        
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar la comunidad.',
                            icon: 'error',
                            confirmButtonColor: '#b685e4',
                            backdrop: `rgba(0,0,0,0.5)`,
                            allowOutsideClick: false,
                            zIndex: 10000
                        });
                    }
                }
            });
        };
    const handleEditCommunity = (e, community) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCommunity(community);
        setFormData({
            nombre: community.nombre,
            descripcion: community.descripcion,
            tipo_privacidad: community.tipo_privacidad || 'publica',
            imagen: null
        });
        setPreviewImage(`http://localhost:3004/uploads/${community.banner}`);
        setShowEditModal(true);
        setShowOptionsMenu(null);
    };
    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editModalRef.current && !editModalRef.current.contains(event.target)) {
                setShowEditModal(false);
            }
        };
    
        if (showEditModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEditModal]);
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imagen: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingCommunity) return;
    
        setIsSubmitting(true);
        setEditMessage(null);
    
        try {
            // Create a regular JSON object instead of FormData for text fields
            const updateData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                tipo_privacidad: formData.tipo_privacidad
            };
            
            // Only use FormData if there's an image
            if (formData.imagen) {
                const formDataToSend = new FormData();
                formDataToSend.append('nombre', formData.nombre);
                formDataToSend.append('descripcion', formData.descripcion);
                formDataToSend.append('tipo_privacidad', formData.tipo_privacidad);
                formDataToSend.append('imagen', formData.imagen);
                
                await updateCommunity(editingCommunity.id, formDataToSend);
            } else {
                // Use JSON for text-only updates
                await updateCommunity(editingCommunity.id, updateData);
            }
            
            setEditMessage({ 
                type: 'success', 
                text: 'Comunidad actualizada correctamente' 
            });
            
            setTimeout(() => {
                setShowEditModal(false);
                window.location.reload(); // Add this back to refresh the page
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar la comunidad:', error);
            setEditMessage({ 
                type: 'error', 
                text: 'Error al actualizar la comunidad' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    // Toggle options menu
    const toggleOptionsMenu = (e, communityId) => {
        e.preventDefault();
        e.stopPropagation();
        setShowOptionsMenu(showOptionsMenu === communityId ? null : communityId);
    };
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showOptionsMenu !== null) {
                setShowOptionsMenu(null);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showOptionsMenu]);
    return (
        <div className="community-Conten">
            <div className='textOcul'>
                {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todas las Comunidades
                    </button>
                    <button 
                        className={`tab ${activeTab === 'my' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my')}
                    >
                        Creadas por mí
                    </button>
                    <button 
                        className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
                        onClick={() => setActiveTab('joined')}
                    >
                        Comunidades Unidas
                    </button>
                </div>
            </div>

            <div className='communitys'>
                {filteredCommunities.map((community) => {
                    const creador = users.find(user => user.id === community.id_creador);
                    const isMyCreatedCommunity = community.id_creador === userId;
                    
                    return (
                        <Link
                        to={`/comunidad/${community.id}`}
                        key={community.id}
                        className='communitys-Info'
                        onClick={(e) => handleCommunityClick(e, community)}
                        style={{ backgroundImage: `url(http://localhost:3004/uploads/${community.banner})` }}>

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
                                {/* Options menu for my created communities */}
                                {isMyCreatedCommunity && activeTab === 'my' ? (
                                    <div className="community-options relative ml-auto">
                                        <button 
                                            className="options-button p-1 rounded-full hover:bg-gray-100"
                                            onClick={(e) => toggleOptionsMenu(e, community.id)}
                                        >
                                            <FiMoreVertical className="text-xl text-gray-600" />
                                        </button>
                                        
                                        {showOptionsMenu === community.id && (
                                            <div className="options-menu absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-36 py-1">
                                                <button 
                                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                                                    onClick={(e) => handleEditCommunity(e, community)}
                                                >
                                                    <FiEdit className="text-blue-500" />
                                                    <span>Editar</span>
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-500"
                                                    onClick={(e) => handleDeleteCommunity(e, community.id)}
                                                >
                                                    <FiTrash2 />
                                                    <span>Eliminar</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                    {!isMyCreatedCommunity && (
                                        <button 
                                        type="button"
                                        onClick={(e) => handleMembership(e, community.id)}
                                        className={membershipStatus[community.id] ? 'leave-btn' : 'join-btn'}>
                                           {membershipStatus[community.id] ? 'Dejar' : 'Unirse'}
                                        </button>
                                    )}
                                    {isMyCreatedCommunity && (
                                        <span className="creator-badge">Creador</span>
                                    )}
                                    </>
                                )}
                            </div>

                            <div className="infoCommunity">
                                <p>{community.descripcion}</p>
                            </div>
                        </Link>
                    );
                })}
                
                {filteredCommunities.length === 0 && (
                    <div className="no-communities">
                        {activeTab === 'my' 
                            ? 'No te has unido a ninguna comunidad todavía.' 
                            : 'No hay comunidades disponibles.'}
                    </div>
                )}
            </div>
            {showEditModal && editingCommunity && (
                <div className="edit-modal-overlay">
                    <div ref={editModalRef} className="edit-form-post">
                        <div className="edit-form-header">
                            <h2 className="edit-text-publi">
                                <FiEdit className="edit-icono-publicacion" /> Editar Comunidad
                            </h2>
                            <button 
                                className="edit-close-button" 
                                onClick={() => setShowEditModal(false)}
                            >
                                <IoClose />
                            </button>
                        </div>

                        {editMessage && (
                            <div className={`edit-mensaje ${editMessage.type === 'error' ? 'error' : 'success'}`}>
                                {editMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="edit-form-group">
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    name="nombre"
                                    placeholder="Nombre de la comunidad"
                                    required
                                />
                            </div>

                            <div className="edit-form-group">
                                <textarea
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    name="descripcion"
                                    placeholder="Descripción de la comunidad"
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="edit-form-group">
                                <select
                                    value={formData.tipo_privacidad}
                                    onChange={handleInputChange}
                                    name="tipo_privacidad"
                                    required
                                >
                                    <option value="publica">Pública</option>
                                    <option value="privada">Privada</option>
                                </select>
                            </div>

                            <div className="edit-form-group">
                                <label htmlFor="imagen">Imagen de la comunidad (opcional)</label>
                                <input
                                    type="file"
                                    id="imagen"
                                    name="imagen"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </div>

                            {previewImage && (
                                <div className="edit-image-preview">
                                    <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
                                    <img 
                                        src={previewImage}
                                        alt="Vista previa" 
                                        className="w-full max-h-40 object-contain rounded-md"
                                    />
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="edit-submit-button" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Actualizando..." : "Actualizar Comunidad"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;

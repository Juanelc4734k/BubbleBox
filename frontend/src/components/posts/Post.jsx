import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { getReactionsPosts, createReactionPost, deleteReaction } from '../../services/reactions';
import { getUserProfile } from '../../services/users';
import { deletePost, updatePost } from '../../services/posts';
import { getCommentsByPost } from '../../services/comments';
import '../../assets/css/layout/post.css';
import { BsHandThumbsUp } from "react-icons/bs";
// import { MdOutlineInsertComment } from "react-icons/md";
import { IoArrowRedoOutline } from "react-icons/io5";
import { TiDeleteOutline } from "react-icons/ti";
import { FiMoreVertical, FiEdit, FiTrash2, FiFlag } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { IoClose } from 'react-icons/io5';
import Swal from 'sweetalert2'
import '../../assets/css/app/sweetCustom.css'
import ModalReport from '../reports/modalReport';

const Post = forwardRef((props, ref) => {
    const { post, isMyPostsTab, openCommentsSidebar } = props;
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
   
    const [imgaiAmplia, setImgAmplia] = useState(null);
    const [reactions, setReactions] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [currentReaction, setCurrentReaction] = useState(null);
    const [reactionSummary, setReactionSummary] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const userId = localStorage.getItem('userId');
    const isMyPost = parseInt(post.id_usuario) === parseInt(userId);
    const [commentCount, setCommentCount] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const [isEditable, setIsEditable] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitulo, setEditTitulo] = useState('');
    const [editContenido, setEditContenido] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const editModalRef = useRef(null);
    const [likedd, setLikedd] = useState(false);
    const [linkedComments, setLikedComments] = useState(false);
    const [ linkedReenviar, setLinkedReenviar] = useState(false);



    const getAvatarSrc = () => {
        if (post.avatar_usuario) {
            // Check if the avatar URL is already complete or needs the base URL
            return post.avatar_usuario.startsWith('http') 
                ? post.avatar_usuario 
                : `http://localhost:3009${post.avatar_usuario}`;
        }
        return avatarPorDefecto;
    };

    const handleCommentClick = () => {
        if (openCommentsSidebar) {
            openCommentsSidebar(post.id, 'post');
        }
    };
    const checkIfEditable = () => {
        if (!post.fecha_creacion) return false;
        
        const postDate = new Date(post.fecha_creacion);
        const currentDate = new Date();
        const hoursDifference = (currentDate - postDate) / (1000 * 60 * 60);
        
        // Post is editable if less than 24 hours old
        return hoursDifference <= 24;
    };

    useEffect(() => {
        if (post && post.fecha_creacion) {
            setIsEditable(checkIfEditable());
        }
    }, [post]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                if (post.id) {
                    const comments = await getCommentsByPost(post.id);
                    setCommentCount(comments.length);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        
        fetchComments();
    }, [post.id]);


    //Lista de reacciones
    const reactionTypes = [
        {type: 'love', emoji: '❤️'},
        {type: 'funny', emoji: '😂'},
        {type: 'sad', emoji: '😢'},
        {type: 'amazing', emoji: '😲'},
        {type: 'angry', emoji: '😡'},
        {type: 'bored', emoji: '😴'},
    ]

    //Funcion para crear reacciones
    const handleReaction = async (reactionType = 'like') => {
        try {
            // Prevent event object from being passed
            if (typeof reactionType === 'object') {
                reactionType = 'like';
            }

            const userReaction = reactions.find(reaction => 
                reaction.id_usuario === Number(userId) && 
                reaction.tipo === reactionType
            );

            if (!userReaction) {
                const reactionData = {
                    tipo: reactionType,
                    id_usuario: Number(userId), // Ensure userId is a number
                    id_contenido: Number(post.id), // Ensure post.id is a number
                    tipo_contenido: "publicacion"
                };
                await createReactionPost(reactionData);
            } else {
                const deleteData = {
                    id_usuario: Number(userId),
                    id_contenido: Number(post.id),
                    tipo_contenido: "publicacion"
                };
                await deleteReaction(deleteData);
            }

            const updatedReactions = await getReactionsPosts(post.id);
            setReactions(updatedReactions);
            
            if (reactionType === 'like') {
                const hasLike = updatedReactions.some(r => 
                    r.id_usuario === Number(userId) && r.tipo === 'like'
                );
                setIsLiked(hasLike);
            }
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    }
        const imgAbrir = (src) => {
            setImgAmplia(src);
        };

        const imgCerrar = () => {
            setImgAmplia(null);
        }

        //Hover reacciones
        const handleMouseEnter = () => {
            if (timeoutId) clearTimeout(timeoutId);
            setShowReactions(true);
        };

        //Funcion para cerrar las reacciones
        const handleMouseLeave = () => {
            const newTimeout = setTimeout(() => {
                setShowReactions(false);
            }, 500);
            setTimeoutId(newTimeout);
        };

        //Funcion para expandir el texto
        const toggleExpand = () => {
            setIsExpanded(!isExpanded);
        };


    //Obtener reacciones
    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const reactions = await getReactionsPosts(post.id);
                setReactions(reactions);
            } catch (error) {
                console.error('Error fetching reactions:', error);
            }
        };

        if(post.id){
            fetchReactions();
        }
    }, [post.id]);


    //Actualizar resumen de reacciones
    const updateReactionSummary = async (reactions) => {
        if (reactions.length === 0) {
            setReactionSummary('');
            return;
        }
    
        try {
            // Group users by reaction type
            const reactionGroups = {};
            const uniqueEmojis = new Set();
            
            for (const reaction of reactions) {
                const emoji = reaction.tipo === 'like' ? '👍' : 
                            reactionTypes.find(r => r.type === reaction.tipo)?.emoji || '';
                uniqueEmojis.add(emoji);
                
                if (!reactionGroups[reaction.tipo]) {
                    reactionGroups[reaction.tipo] = [];
                }
                const user = await getUserProfile(reaction.id_usuario);
                reactionGroups[reaction.tipo].push(user.nombre);
            }

            // Create emoji string
            const emojiString = Array.from(uniqueEmojis).join(' ');
            
            // Create users string
            const allUsers = [...new Set(Object.values(reactionGroups).flat())];
            let userString;
            
            if (allUsers.length === 1) {
                userString = `${allUsers[0]} ha reaccionado`;
            } else if (allUsers.length === 2) {
                userString = `${allUsers[0]} y ${allUsers[1]} han reaccionado`;
            } else {
                userString = `${allUsers[0]} y ${allUsers.length - 1} más han reaccionado`;
            }

            setReactionSummary(`${emojiString} ${userString}`);
        } catch (error) {
            console.error('Error updating reaction summary:', error);
        }
    };

    //Actualizar resumen de reacciones y estado de reacción actual
    useEffect(() => {
        if (reactions.length > 0) {
            updateReactionSummary(reactions);
            const userReaction = reactions.find(reaction => 
                reaction.id_usuario === Number(userId)
            );
            setIsLiked(!!userReaction);
            if (userReaction && reactionTypes.some(r => r.type === userReaction.tipo)) {
                setCurrentReaction(userReaction.tipo);
            } else {
                setCurrentReaction(null);
            }
        } else {
            setReactionSummary('');
            setIsLiked(false);
            setCurrentReaction(null);
        }
    }, [reactions, userId]);

    // Handle post options menu
    const toggleOptionsMenu = (e) => {
        e.stopPropagation();
        setShowOptionsMenu(!showOptionsMenu);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showOptionsMenu) {
                setShowOptionsMenu(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showOptionsMenu]);

    const handleDeletePost = async (e) => {
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
                    await deletePost(post.id);
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'Tu publicación ha sido eliminada.',
                        icon: 'success',
                        confirmButtonColor: '#b685e4',
                        backdrop: `rgba(0,0,0,0.5)`,
                        allowOutsideClick: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Error al eliminar la publicación:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la publicación.',
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

    // Handle post edit
    // Handle opening the edit modal
    const handleEditPost = (e) => {
        e.stopPropagation();
        setEditTitulo(post.titulo || '');
        setEditContenido(post.contenido || '');
        setShowEditModal(true);
        setShowOptionsMenu(false); // Close the options menu
    };

    // Handle form submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if(isSubmittingEdit) return;
        setIsSubmittingEdit(true);
        setEditMessage('');
    
        if(!editTitulo || !editContenido){
            setEditMessage('Por favor, completa todos los campos.');
            setTimeout(() => {
                setEditMessage('');
            }, 2000)
            setIsSubmittingEdit(false);
            return;
        }
    
        try {
            const updateData = {
                id: post.id,
                titulo: editTitulo.trim(),
                contenido: editContenido,
            }
    
            const response = await updatePost(updateData);
            setEditMessage('Publicación editada con éxito');
    
            setTimeout(() => {
                setShowEditModal(false);
                setEditMessage('');
                setIsSubmittingEdit(false);
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error al editar la publicación:', error);
            
            // Check if error is due to time expiration
            if (error.response && error.response.status === 403) {
                setEditMessage('No se puede editar la publicación después de 24 horas');
                
                // Show SweetAlert for better UX
                Swal.fire({
                    title: 'Tiempo expirado',
                    text: 'No se puede editar la publicación después de 24 horas',
                    icon: 'warning',
                    confirmButtonColor: '#b685e4'
                });
            } else {
                setEditMessage('Error al editar la publicación');
            }
            
            setIsSubmittingEdit(false);
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        setShowShareMenu(!showShareMenu);
    };

    // Build share URL with post details for better sharing context
    const shareUrl = `http://localhost:5173/posts/obtener/${post.id}?title=${encodeURIComponent(post.titulo || '')}&author=${encodeURIComponent(post.nombre_usuario || '')}&type=bubblebox_post`;

    const handleNativeShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.titulo || 'Publicación de BubbleBox',
                    text: `¡Descubre este post en BubbleBox! ${post.titulo || 'Mira esta publicación'}: ${post.contenido || 'Revisa contenido interesante en BubbleBox'}`,
                    url: shareUrl,
                });
                setShowShareMenu(false);
            } else {
                handleCopyLink();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    };


    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            Swal.fire({
                title: '¡Enlace copiado!',
                text: 'El enlace ha sido copiado al portapapeles. ¡Compártelo con tus amigos!',
                icon: 'success',
                confirmButtonColor: '#b685e4',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            setShowShareMenu(false);
        }).catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo copiar el enlace',
                icon: 'error',
                confirmButtonColor: '#b685e4'
            });
        });
    };

    const shareToFacebook = () => {
        const text = `¡No te pierdas esta publicación en BubbleBox! ${post.titulo || 'Descubre esta increíble publicación'}: ${post.contenido || 'Haz clic y conoce más sobre este tema interesante.'}`;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };
    
    const shareToTwitter = () => {
        const text = `¡Descubre este post en BubbleBox! ${post.titulo || 'Mira esta publicación'}: ${shareUrl}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };
    
    const shareToWhatsApp = () => {
        const text = `${post.titulo || 'Mira esta publicación en BubbleBox'}\n\nLee más aquí: ${shareUrl}`;
    
        // Asegurarse de que la URL y el texto estén correctamente codificados
        const encodedText = encodeURIComponent(text);
    
        // WhatsApp espera el texto de la siguiente manera
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
        // Abrir WhatsApp para compartir el enlace
        window.open(whatsappUrl, '_blank');
        setShowShareMenu(false);
    };
    
    

    useEffect(() => {
        const handleClickOutside = () => {
            if (showShareMenu) {
                setShowShareMenu(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showShareMenu]);

    useEffect(() => {
        console.log('Modal state:', showEditModal);
    }, [showEditModal]);


    
  
    return (
        <>
            <div className="posts" ref={ref}>
                <div className='post'>

                    <div className="post-autor-info">
                        <p 
                        className='post-fecha-create'>
                        {post.fecha_creacion ? new Date(post.fecha_creacion).toLocaleString() : 'Fecha desconocida'}
                        </p>
                       <div className="post-ft-name">
                            <div className="post-imguser">
                                <img 
                                    src={getAvatarSrc()} 
                                    alt={`Avatar de ${post.nombre_usuario || 'Usuario desconocido'}`} 
                                    className="avatar-usuario"
                                    width="100"
                                    style={ {objectFit: 'cover' }} 
                                    />
                            </div>
                            <div className="info-post">
                                <p>{post.nombre_usuario || 'Usuario desconocido'}</p>
                                <p className='post-title'>{post.titulo}</p>
                            </div>
                            
                            {/* Post options menu */}
                            <div className="post-options relative ml-auto">
                                <button 
                                    className="options-button w-9 p-1 rounded-full hover:bg-gray-100"
                                    onClick={toggleOptionsMenu}
                                >
                                    <i className="fa-solid fa-ellipsis-vertical text-xl text-gray-600"></i>
                                </button>
                                
                                {showOptionsMenu && (
                                    <div className="Post-options-menu absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-36">
                                        {isMyPost && isMyPostsTab ? (
                                            <>
                                                {isEditable ? (
                                                    <button 
                                                        className="edit-post w-full text-left px-4 py-2 flex items-center gap-2 "
                                                        onClick={handleEditPost}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                        <span>Editar</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            Swal.fire({
                                                                title: 'No se puede editar',
                                                                text: 'Las publicaciones solo pueden editarse dentro de las primeras 24 horas',
                                                                icon: 'info',
                                                                confirmButtonColor: '#b685e4'
                                                            });
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square "></i>
                                                        <span>Expirado</span>
                                                    </button>
                                                )}
                                                <button 
                                                    className="post-delete w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-500"
                                                    onClick={handleDeletePost}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                    <span>Eliminar</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-500"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowReportModal(true);
                                                    setShowOptionsMenu(false);
                                                }}
                                            >
                                                <FiFlag />
                                                <span>Reportar</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                       </div>
                    </div>

                    <div className="contenido-post">
                    <div className="post-description">
                        {post.contenido && (
                            <>
                                <div className="hidden md:block">
                                    {post.contenido.length > 50 ? (
                                        <p>
                                            {isExpanded ? post.contenido : `${post.contenido.slice(0, 50)}...`}
                                            <button 
                                                onClick={toggleExpand}
                                                className="text-purple-500 hover:text-purple-800 ml-2 font-medium"
                                            >
                                                {isExpanded ? 'Leer menos' : 'Leer más'}
                                            </button>
                                        </p>
                                    ) : (
                                        <p>{post.contenido}</p>
                                    )}
                                </div>
                                <div className="block md:hidden">
                                    <p>{post.contenido}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="post-conten-img w-[90%] sm:w-[95%] xl:w-[95%] overflow-hidden rounded-md shadow-lg">
                    {post.imagen && <img 
                    src={`http://localhost:3008/uploads/${post.imagen}`} 
                    alt={post.titulo} 
                    className="w-full h-full object-cover cursor-pointer rounded-md shadow-lg" 
                    onClick={() => imgAbrir (`http://localhost:3008/uploads/${post.imagen}`)} />}
                </div>
                    </div>

                    <div className='reaction-summary text-sm text-gray-600 min-h-[25px] pl-7 pb-1 flex items-center'>
                        {reactionSummary}
                    </div>
                    <div className="post-lineTwo"></div>
                    <div className="post-aption flex justify-between items-center px-4 py-2">
                        <div className="post-grup1 flex gap-6 relative">
                            <div className={`post-reacciones flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors ${isLiked ? 'text-blue-500' : ''}`}>
                                <div className="post-conten-reaction relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
                                    {currentReaction && currentReaction !== 'like' ? (
                                        <span 
                                            className="post-reaction-emoji text-xl flex items-center justify-center w-[1em] h-[1em]" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReaction(currentReaction);
                                            }}
                                        >
                                            {reactionTypes.find(r => r.type === currentReaction)?.emoji}
                                        </span>
                                    ) : (

                                            <i
                                              className={`fa-${likedd ? "solid" : "regular"} fa-thumbs-up text-xl cursor-pointer`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setLikedd(!likedd); 
                                                handleReaction('like');
                                              }}
                                            ></i>


                                    )}
                                    {showReactions && (
                                        <div className="post-reactions-menu mb-3">
                                            {reactionTypes.map((reaction) => (
                                                <button
                                                    key={reaction.type}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReaction(reaction.type);
                                                    }}
                                                    title={reaction.type}
                                                >
                                                    {reaction.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {reactions && reactions.filter(reaction => reaction.tipo === 'like').length > 0 && (
                                    <span className="num-reactions text-sm font-medium">
                                        {reactions.filter(reaction => reaction.tipo === 'like').length}
                                    </span>
                                )}
                            </div>
                        
                            <div className="post-comentarios flex items-center gap-2 cursor-pointer"
                             onClick={(e) =>{
                                e.stopPropagation();
                                setLikedComments(!linkedComments);
                                handleCommentClick();
                             }}
                             >
                            <i className={`  fa-${linkedComments ? "solid" : "regular"} fa-regular fa-comment text-xl cursor-pointer`}></i>

                            <span className="text-sm font-medium ">{commentCount}</span>
                            </div>
                        </div>
                        <div className="grup2">
                            <div className="post-reenviar relative cursor-pointer" onClick={handleShare} title='Compartir publicación'>
                            <div className="icon-post-share">

                            <i className="fa-solid fa-share-nodes"></i>                
                            </div>
            
                               
                               {showShareMenu && (
                                    <div className="post-share-menu absolute right-0 bottom-10 bg-purple-300 rounded-md shadow-lg z-10 w-40 mb-5">
                                       
                                        <button 
                                            className="w-full text-left"
                                            onClick={handleNativeShare}
                                        >
                                            <i className="fa-solid fa-share"></i>
                                            Compartir
                                        </button>

                                        <button 
                                            className="w-full text-left"
                                            onClick={handleCopyLink}
                                        >
                                            <i className="fa-solid fa-paperclip"></i>
                                            Copiar enlace
                                        </button>

                                        <button 
                                            className="w-full text-left text-blue-600"
                                            onClick={shareToFacebook}
                                        >
                                            <i className="fa-brands fa-facebook-f"></i>
                                            Facebook
                                        </button>

                                        <button 
                                            className="w-full text-left text-blue-400"
                                            onClick={shareToTwitter}
                                        >
                                            <i className="fa-brands fa-twitter"></i>
                                            Twitter
                                        </button>

                                        <button 
                                            className="w-full text-left text-green-500"
                                            onClick={shareToWhatsApp}
                                        >
                                            <i className="fa-brands fa-whatsapp"></i>
                                            WhatsApp
                                        </button>
                                        
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {imgaiAmplia && (
                <div className= {`contImagenPost ${imgaiAmplia ? 'imagen' :''}`} onClick={imgCerrar}   title="Toca para salir">
                    <div className="fondo">

                    <div  className='imgpost'>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    
                    <img src={imgaiAmplia} alt="imagen ampliada"/>
                    </div>
                    </div>

                </div>
            )}
            {/* Edit Post Modal */}
            {showEditModal && (
                <div className="edit-modal-overlay">

                    <div ref={editModalRef} className="edit-form-post">
                        <div className="form-header-modal-post">
                        <div className="edit-form-header">
                            <h2 className="edit-text-publi">
                                <FiEdit className="edit-icono-publicacion" /> Editar Publicación
                            </h2>
                            <button className="edit-close-button" onClick={() => setShowEditModal(false)}>
                                <IoClose />
                            </button>
                        </div>
                        <div className="edit-time">
                            {post.fecha_creacion && (
                            <div className="time-edit-2">
                                <IoMdTime className='ico-time-2' />
                                <p> Las publicaciones solo pueden editarse dentro de las primeras 24 horas</p>
                            </div>
                        )}
                        </div>
                        </div>
                        
                        <div className="modal-body-form-post">
                                                 <div className="conten-edit-mensaje">
                         {editMessage && (
                            <div className={`edit-mensaje ${editMessage.includes('Error') || editMessage.includes('No se puede') ? 'error' : 'success'}`}>
                                {editMessage}
                        </div>
                        )}
                        </div>

                        <form onSubmit={handleEditSubmit}>  {/* Change this line */}
                            <div className="edit-form-group">
                                <input
                                    type="text"
                                    value={editTitulo}
                                    onChange={(e) => setEditTitulo(e.target.value)}
                                    placeholder="Título de la publicación"
                                />
                            </div>
                            <div className="edit-form-group">
                                <textarea
                                    value={editContenido}
                                    onChange={(e) => setEditContenido(e.target.value)}
                                    placeholder="¿Qué estás pensando?"
                                    rows={5}
                                />
                            </div>
                            {post.imagen && (
                                <div className="edit-image-preview">
                                    <p className="text-sm text-gray-500 mb-2">Imagen actual (<span>no se puede cambiar</span>):</p> 
                                    <img 
                                        src={`http://localhost:3008/uploads/${post.imagen}`} 
                                        alt={post.titulo} 
                                        className="w-full max-h-40 object-contain rounded-md"
                                    />
                                </div>
                            )}
                            <button type="submit" className="edit-submit-button" disabled={isSubmittingEdit}>
                                {isSubmittingEdit ? "Actualizando..." : "Actualizar"}
                            </button>
                        </form>   
                        </div>

                    </div>
                </div>
            )}
            <ModalReport
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                contentId={post.id}
                contentType="publicacion"
                reportedUserId={post.id_usuario}
            />
        </>
        
    );
    
});

// Add display name to satisfy ESLint
Post.displayName = 'Post';

export default Post;

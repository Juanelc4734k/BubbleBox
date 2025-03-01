import React, { useState, useEffect } from 'react';
import { getReactionsPosts, createReactionPost, deleteReaction } from '../../services/reactions';
import { getUserProfile } from '../../services/users';
import '../../assets/css/layout/post.css';
import { BsHandThumbsUp } from "react-icons/bs";
import { MdOutlineInsertComment } from "react-icons/md";
import { IoArrowRedoOutline } from "react-icons/io5";
import { TiDeleteOutline } from "react-icons/ti";

const Post = ({ post }) => {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
   
    const [imgaiAmplia, setImgAmplia] = useState(null);
    const [reactions, setReactions] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [currentReaction, setCurrentReaction] = useState(null);
    const [reactionSummary, setReactionSummary] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const userId = localStorage.getItem('userId');

    const getAvatarSrc = () => {
        if (post.avatar_usuario) {
            // Check if the avatar URL is already complete or needs the base URL
            return post.avatar_usuario.startsWith('http') 
                ? post.avatar_usuario 
                : `http://localhost:3009${post.avatar_usuario}`;
        }
        return avatarPorDefecto;
    };

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

    return (
        <>
            <div className="posts">
                <div className='post'>

                    <div className="autor-info">
                        <p className='fechacreate'>{post.fecha_creacion ? new Date(post.fecha_creacion).toLocaleString() : 'Fecha desconocida'}</p>
                       <div className="ft-name">
                            <div className="imguser">
                                <img 
                                    src={getAvatarSrc()} 
                                    alt={`Avatar de ${post.nombre_usuario || 'Usuario desconocido'}`} 
                                    className="avatar-usuario"
                                    width="100"
                                    style={ {objectFit: 'contain' }} 
                                    />
                            </div>
                            <div className="info-post">
                                <p>{post.nombre_usuario || 'Usuario desconocido'}</p>
                                <p className='post-title'>{post.titulo}</p>
                            </div>
                       </div>
                    </div>

                    <div className="contenido-post">
                    <div className="description">
                        {post.contenido && (
                            <>
                                <div className="hidden md:block">
                                    {post.contenido.length > 50 ? (
                                        <p>
                                            {isExpanded ? post.contenido : `${post.contenido.slice(0, 50)}...`}
                                            <button 
                                                onClick={toggleExpand}
                                                className="text-blue-500 hover:text-blue-700 ml-2 font-medium"
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
                    <div className="imgconten w-[90%] sm:w-[95%] xl:w-[95.5%] h-[35vh] sm:max-h-[10vh] lg:max-h-[50vh]  mx-3 overflow-hidden rounded-md shadow-lg">
                    {post.imagen && <img 
                    src={`http://localhost:3008/uploads/${post.imagen}`} 
                    alt={post.titulo} 
                    className="w-full h-full object-cover cursor-pointer rounded-md shadow-lg" 
                    onClick={() => imgAbrir (`http://localhost:3008/uploads/${post.imagen}`)} />}
                </div>
                    </div>

                    <div className='reaction-summary text-sm text-gray-600 min-h-[25px] pl-12 pb-1 flex items-center'>
                        {reactionSummary}
                    </div>
                    <div className="lineTwo"></div>
                    <div className="aption flex justify-between items-center px-4 py-2">
                        <div className="grup1 flex gap-6 relative">
                            <div className={`reacciones flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors ${isLiked ? 'text-blue-500' : ''}`}>
                                <div className="relative"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {currentReaction && currentReaction !== 'like' ? (
                                        <span 
                                            className="text-xl reaction-emoji animate-reaction flex items-center justify-center w-[1em] h-[1em]" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReaction(currentReaction);
                                            }}
                                        >
                                            {reactionTypes.find(r => r.type === currentReaction)?.emoji}
                                        </span>
                                    ) : (
                                        <BsHandThumbsUp 
                                            className="text-xl" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReaction('like');
                                            }}
                                        />
                                    )}
                                    {showReactions && (
                                        <div className="reactions-menu">
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
                            <div className="comentarios flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors">
                                <MdOutlineInsertComment className="text-xl"/>
                                <span className="text-sm font-medium">0</span>
                            </div>
                        </div>
                        <div className="grup2">
                            <div className="reenviar cursor-pointer hover:text-blue-500 transition-colors">
                                <IoArrowRedoOutline className="text-xl"/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {imgaiAmplia && (
                <div className= {`contImagenPost ${imgaiAmplia ? 'imagen' :''}`} >

                    <TiDeleteOutline className='salir' onClick={imgCerrar}/>
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

        </>
        
    );
    
};

export default Post;
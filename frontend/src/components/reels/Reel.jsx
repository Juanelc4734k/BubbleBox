import React, { useState, useRef, useEffect } from 'react';
import { createReactionReel, getReactionsReels, deleteReaction } from '../../services/reactions';
import { deleteReel } from '../../services/reels';
import ModalReport from '../reports/modalReport';
import { BsHandThumbsUp, BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoArrowRedoOutline } from 'react-icons/io5';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import '../../assets/css/layout/reels.css';
import Swal from 'sweetalert2';

const Reel = ({ reel, isMyReelsTab, openCommentsSidebar }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [reactions, setReactions] = useState([]);
    const videoRef = useRef(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const userId = localStorage.getItem('userId');
    const isMyReel = reel.usuario_id === parseInt(userId);

    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (reel.avatar) {
            return reel.avatar.startsWith('http')
                ? reel.avatar
                : `http://localhost:3009${reel.avatar}`;
        }
        return avatarPorDefecto;
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleProgressClick = (e) => {
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
            videoRef.current.currentTime = clickPosition * videoRef.current.duration;
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            setIsHorizontal(videoWidth > videoHeight);
        }
    };

    const handleReaction = async () => {
        try {
            if (!isLiked) {
                const reactionData = {
                    tipo: "like",
                    id_usuario: userId,
                    id_contenido: reel.id,
                    tipo_contenido: "reel"
                };
                await createReactionReel(reactionData);
                setReactions(prevReactions => [...prevReactions, reactionData]);
            } else {
                const deleteData = {
                    id_usuario: userId,
                    id_contenido: reel.id,
                    tipo_contenido: "reel"
                };
                await deleteReaction(deleteData);
                setReactions(prevReactions => 
                    prevReactions.filter(reaction => 
                        reaction.id_usuario !== Number(userId)
                    )
                );
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const reactionsData = await getReactionsReels(reel.id);
                setReactions(reactionsData);
                const userHasLiked = reactionsData.some(reaction => reaction.id_usuario === Number(userId) && reaction.tipo === "like");
                setIsLiked(userHasLiked);
            } catch (error) {
                console.error('Error al obtener las reacciones:', error);
            }
        };

        if (reel.id) {
            fetchReactions();
        }
    }, [reel.id, userId]);

    const handleDeleteReel = async (e) => {
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
                    await deleteReel(reel.id);
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'Tu reel ha sido eliminado.',
                        icon: 'success',
                        confirmButtonColor: '#b685e4',
                        backdrop: `rgba(0,0,0,0.5)`,
                        allowOutsideClick: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Error al eliminar el reel:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el reel.',
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

    // Add toggle menu function
    const toggleOptionsMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowOptionsMenu(!showOptionsMenu);
    };

    // Add click outside handler
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

    // Add handler for comment button click
    const handleCommentClick = () => {
        if (openCommentsSidebar) {
            openCommentsSidebar(reel.id, 'reel');
        }
    };

    // Add share functionality
    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowShareMenu(!showShareMenu);
    };

    const shareUrl = `http://localhost:5173/reels/${reel.id}`;
    
    const handleNativeShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Reel de BubbleBox',
                    text: reel.descripcion || 'Mira este reel en BubbleBox',
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
                text: 'El enlace ha sido copiado al portapapeles',
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
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareMenu(false);
    };

    const shareToTwitter = () => {
        const text = reel.descripcion || 'Mira este reel en BubbleBox';
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareMenu(false);
    };

    const shareToWhatsApp = () => {
        const text = `${reel.descripcion || 'Mira este reel en BubbleBox'}: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };

    // Close share menu when clicking outside
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

    return (
        <div className="reel">
            <div className="reel-header">
                <div className="reel-info">
                    <div className="reel-author">
                        <img src={getAvatarSrc()} alt={`Avatar de ${reel.username || 'Usuario desconocido'}`} />
                        <div className="reel-author-info">
                            <p>{reel.username || 'Usuario desconocido'}</p>
                            <p>{new Date(reel.fecha_creacion).toLocaleString()}</p>
                        </div>
                        {isMyReel && isMyReelsTab && (
                            <div className="reel-options relative ml-auto">
                                <button 
                                    className="options-button p-1 rounded-full hover:bg-gray-100"
                                    onClick={toggleOptionsMenu}
                                >
                                    <FiMoreVertical className="text-xl text-gray-600" />
                                </button>
                                
                                {showOptionsMenu && (
                                    <div className="options-menu absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-36 py-1">
                                        {isMyReel ? (
                                            <button 
                                                className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-500"
                                                onClick={handleDeleteReel}
                                            >
                                                <FiTrash2 />
                                                <span>Eliminar</span>
                                            </button>
                                        ) : (
                                            <button 
                                                className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-500"
                                                onClick={() => setShowReportModal(true)}
                                            >
                                                <FiFlag />
                                                <span>Reportar</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="reel-content">
                <div className={`reel-video-container ${isHorizontal ? 'horizontal' : ''}`}>
                    <video
                        ref={videoRef}
                        className="reel-video"
                        src={`http://localhost:3002/uploads/${reel.archivo_video}`}
                        onTimeUpdate={handleTimeUpdate}
                        onClick={togglePlay}
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                    <div className="video-controls">
                        <button className="video-control-button" onClick={togglePlay}>
                            {isPlaying ? <BsPauseFill size={24} /> : <BsPlayFill size={24} />}
                        </button>
                        <div className="video-progress" onClick={handleProgressClick}>
                            <div
                                className="video-progress-filled"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className={`reel-actions-vertical ${isHorizontal ? 'horizontal' : ''}`}>
                    <button 
                        className={`reel-action-button ${isLiked ? 'liked' : ''}`} 
                        onClick={handleReaction}>
                        <BsHandThumbsUp 
                            size={24} 
                            className={isLiked ? 'text-blue-500' : ''}/>
                    </button>
                    <button className="reel-action-button" onClick={handleCommentClick}>
                        <MdOutlineInsertComment size={24} />
                    </button>
                    <button className="reel-action-button relative" onClick={handleShare}>
                        <IoArrowRedoOutline size={24} />
                        
                        {showShareMenu && (
                            <div className="share-menu absolute right-0 bottom-10 bg-white rounded-md shadow-lg z-10 w-48 py-1">
                                <button 
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                                    onClick={handleNativeShare}
                                >
                                    <span>Compartir</span>
                                </button>
                                <button 
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                                    onClick={handleCopyLink}
                                >
                                    <span>Copiar enlace</span>
                                </button>
                                <button 
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-blue-600"
                                    onClick={shareToFacebook}
                                >
                                    <span>Facebook</span>
                                </button>
                                <button 
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-blue-400"
                                    onClick={shareToTwitter}
                                >
                                    <span>Twitter</span>
                                </button>
                                <button 
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-green-500"
                                    onClick={shareToWhatsApp}
                                >
                                    <span>WhatsApp</span>
                                </button>
                            </div>
                        )}
                    </button>
                </div>
            </div>
            
            <p className="reel-description">{reel.descripcion}</p>

            {/* Report Modal */}
            <ModalReport
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                contentId={reel.id}
                contentType="reel"
                reportedUserId={reel.usuario_id}
            />
        </div>
    );
};

export default Reel;
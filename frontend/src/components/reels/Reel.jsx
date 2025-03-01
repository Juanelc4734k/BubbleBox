import React, { useState, useRef, useEffect } from 'react';
import { createReactionReel, getReactionsReels, deleteReaction } from '../../services/reactions';
import { BsHandThumbsUp, BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoArrowRedoOutline } from 'react-icons/io5';
import '../../assets/css/layout/reels.css';

const Reel = ({ reel }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [reactions, setReactions] = useState([]);
    const userId = localStorage.getItem('userId');
    const videoRef = useRef(null);

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
    }, [reel.id, userId])

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
                    <button className="reel-action-button">
                        <MdOutlineInsertComment size={24} />
                    </button>
                    <button className="reel-action-button">
                        <IoArrowRedoOutline size={24} />
                    </button>
                </div>
            </div>
            
            <p className="reel-description">{reel.descripcion}</p>
        </div>
    );
};

export default Reel;
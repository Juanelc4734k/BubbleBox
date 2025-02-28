import React, { useState, useRef } from 'react';
import { BsHandThumbsUp, BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoArrowRedoOutline } from 'react-icons/io5';
import '../../assets/css/layout/reels.css';

const Reel = ({ reel }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHorizontal, setIsHorizontal] = useState(false);
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
                    <button className="reel-action-button">
                        <BsHandThumbsUp size={24} />
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
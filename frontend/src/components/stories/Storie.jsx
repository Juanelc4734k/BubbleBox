import { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/users';
import { registerVista, getVista } from '../../services/stories';
import { TiDeleteOutline } from "react-icons/ti";
import { FaEye } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import '../../assets/css/layout/stories.css';

const Storie = ({ stories, onPrevUser, onNextUser, isFirst, isLast }) => {
    const [user, setUser] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [storyViews, setStoryViews] = useState({});
    const [viewedStories, setViewedStories] = useState(new Set());
    const [viewersList, setViewersList] = useState({});
    const [showViewers, setShowViewers] = useState(false);
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const currentUserId = localStorage.getItem('userId');
    const [storyBackground, setStoryBackground] = useState(null);

    const backgroundColors = [
        'linear-gradient(45deg, #ff6b6b, #feca57)',
        'linear-gradient(45deg, #48dbfb, #1dd1a1)',
        'linear-gradient(45deg, #5f27cd, #c8d6e5)',
        'linear-gradient(45deg, #ff9ff3, #feca57)',
        'linear-gradient(45deg, #0abde3, #10ac84)'
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserProfile(stories[0].usuario_id);
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchData();
    }, [stories]);

    useEffect(() => {
        const fetchViews = async () => {
            try {
                const viewsData = {};
                const viewedSet = new Set();
                const viewersData = {};

                for (const story of stories) {
                    const response = await getVista(story.id);
                    viewsData[story.id] = response.data.length;
                    viewersData[story.id] = response.data;
                    
                    // Check if current user has already viewed this story
                    if (currentUserId) {
                        const hasViewed = response.data.some(
                            view => view.id.toString() === currentUserId.toString()
                        );
                        if (hasViewed) {
                            viewedSet.add(story.id);
                        }
                    }
                }
                setStoryViews(viewsData);
                setViewedStories(viewedSet);
                setViewersList(viewersData);
            } catch (error) {
                console.error('Error fetching views:', error);
            }
        };
        fetchViews();
    }, [stories, currentUserId]);

    const registerView = async (storyId) => {
        if(
            viewedStories.has(storyId) ||
            !currentUserId ||
            stories.find(s => s.id === storyId)?.
            usuario_id === parseInt(currentUserId)
        ) {
            return;
        }
        try {
            await registerVista(storyId, currentUserId);

            setViewedStories(prev => {
                const newSet = new Set(prev);
                newSet.add(storyId);
                return newSet;
            });
            // Update view count locally
            setStoryViews(prev => ({
                ...prev,
                [storyId]: (prev[storyId] || 0) + 1
            }));
        } catch (error) {
            console.error('Error registering view:', error);
        }
    };

    const handleClose = () => {
        setIsExpanded(false);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentStoryIndex < stories.length - 1) {
            const nextIndex = currentStoryIndex + 1;
            setCurrentStoryIndex(nextIndex);
            
            // Register view for the next story
            registerView(stories[nextIndex].id);
        } else if (!isLast) {
            onNextUser();
            setCurrentStoryIndex(0);
        } else {
            handleClose();
        }
    };

    const handleExpand = () => {
        setIsExpanded(true);
        setCurrentStoryIndex(0);

        if (stories.length > 0 && stories[0].usuario_id !== parseInt(currentUserId)) {
            registerView(stories[0].id);
        }
    };

    const handlePrevious = (e) => {
        e.stopPropagation();
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else if (!isFirst) {
            onPrevUser();
            setCurrentStoryIndex(0);
        }
    };

    const toggleViewers = () => {
        setShowViewers(!showViewers);
    };


    const getAvatarSrc = () => {
        if (user?.avatar) {
            return user.avatar.startsWith('http') 
                ? user.avatar 
                : `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };

    useEffect(() => {
        if (isExpanded) {
            setStoryBackground(getRandomBackground());
        }
    }, [isExpanded]);

    const getRandomBackground = () => {
        const seed = currentStoryIndex;  // Use current story index as seed
        return backgroundColors[seed % backgroundColors.length];
    };


    const renderStoryContent = () => {
        if (currentStory.tipo === 'texto') {
            return (
                <div 
                    className="story-text-content"
                    style={{ background: getRandomBackground() }}
                >
                    {currentStory.contenido}
                </div>
            );
        }
        if (currentStory.tipo === 'video') {
            return (
                <div className="story-video-container">
                    <video 
                        key={currentStory.id}  // Add unique key
                        className="story-video"
                        controls
                        autoPlay
                        loop
                    >
                        <source 
                            src={`http://localhost:3003${currentStory.contenido}`} 
                            type={`video/${currentStory.contenido.split('.').pop()}`}
                        />
                        Tu navegador no soporta videos.
                    </video>
                </div>
            );
        }
        return (
            <img 
                src={`http://localhost:3003${currentStory.contenido}`}
                alt="Story content"
                className="story-image-full"
            />
        );
    };

    const currentStory = stories[currentStoryIndex];
    const isOwnStory = stories[0].usuario_id === parseInt(currentUserId);

    return (
        <>
            <div className="story-circle" onClick={handleExpand}>
                <img 
                    src={getAvatarSrc()}
                    alt="User avatar"
                    className="story-thumbnail"
                />
                {isOwnStory && 
                    <div className="my-story-indicator"></div>
                }
            </div>

            {isExpanded && (
                <div className="story-modal">
                    <TiDeleteOutline className='close-button left-aligned' onClick={handleClose}/>
                    <div className="story-modal-content">
                        <div className="story-header">
                            <img 
                                src={getAvatarSrc()}
                                alt={user?.username}
                                className="user-avatar-large"
                            />
                            <div className="user-info">
                                <h3>{user?.username}</h3>
                                <p className="story-timestamp">
                                    {new Date(currentStory.fecha_creacion).toLocaleString()}
                                </p>
                            </div>
                            <div 
                                className={`story-views ${isOwnStory ? 'clickable' : ''}`} 
                                onClick={isOwnStory ? toggleViewers : undefined}
                            >
                                <FaEye />
                                <span>{storyViews[currentStory.id] || 0}</span>
                            </div>
                        </div>
                        {showViewers && isOwnStory && (
                            <div className="viewers-list">
                                <h4>Visto por:</h4>
                                {viewersList[currentStory.id]?.length > 0 ? (
                                    <ul>
                                        {viewersList[currentStory.id].map(viewer => (
                                            <li key={viewer.id} className="viewer-item">
                                                <span className="viewer-name">{viewer.nombre}</span>
                                                <span className="viewer-time">
                                                    {new Date(viewer.fecha_vista).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-viewers">Nadie ha visto esta historia aún</p>
                                )}
                            </div>
                        )}
                        <div className="story-navigation">
                            <button 
                                className="nav-button prev" 
                                onClick={handlePrevious}
                                style={{ display: (currentStoryIndex > 0 || !isFirst) ? 'flex' : 'none' }}
                            >
                                <IoIosArrowBack />
                            </button>
                            <div className="story-image-container">
                                {renderStoryContent()}
                            </div>
                            <button 
                                className="nav-button next" 
                                onClick={handleNext}
                                style={{ display: (currentStoryIndex < stories.length - 1 || !isLast) ? 'flex' : 'none' }}
                            >
                                <IoIosArrowForward />
                            </button>
                        </div>
                        <div className="story-indicators">
                            {stories.map((_, index) => (
                                <div 
                                    key={index} 
                                    className={`story-indicator ${index === currentStoryIndex ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Storie;

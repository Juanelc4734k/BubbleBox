import { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/users';
import { TiDeleteOutline } from "react-icons/ti";
import '../../assets/css/layout/stories.css';

const Storie = ({ story }) => {
    console.log(story);
    const [user, setUser] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserProfile(story.usuario_id);
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchData();
    }, [story.usuario_id]);

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleClose = () => {
        setIsExpanded(false);
    };

    const getAvatarSrc = () => {
        if (user?.avatar) {
            return user.avatar.startsWith('http') 
                ? user.avatar 
                : `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };

    return (
        <>
            <div className="story-circle" onClick={handleExpand}>
                <img 
                    src={`http://localhost:3003${story.contenido}`}
                    alt="Story content"
                    className="story-thumbnail"
                />
            </div>

            {isExpanded && (
                <div className="story-modal">
                    <TiDeleteOutline className='close-button' onClick={handleClose}/>
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
                                    {new Date(story.fecha_creacion).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="story-image-container">
                            <img 
                                src={`http://localhost:3003${story.contenido}`}
                                alt="Story content"
                                className="story-image-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Storie;
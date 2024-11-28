import React from 'react';
import '../../assets/css/layout/post.css';

const Post = ({ post }) => {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (post.avatar_usuario) {
            return `http://localhost:3009${post.avatar_usuario}`;
        }
        return avatarPorDefecto;
    };
    
    return (
        <>
            <div className="posts">
                <div className='post'>
                    <div className="autor-info">
                        <img 
                            src={getAvatarSrc()} 
                            alt={`Avatar de ${post.nombre_usuario || 'Usuario desconocido'}`} 
                            className="avatar-usuario"
                            width="100"
                            style={{ borderRadius: '50%', objectFit: 'contain' }}
                        />
                        <p>Publicado por {post.nombre_usuario || 'Usuario desconocido'}</p>
                    </div>
                    <h2>{post.titulo}</h2>
                    <p>{post.contenido}</p>
                    {post.imagen && <img src={post.imagen} alt={post.titulo} />}
                    <p>{post.fecha_creacion ? new Date(post.fecha_creacion).toLocaleString() : 'Fecha desconocida'}</p>
                </div>
            </div>
        </>
        
    );
};

export default Post;
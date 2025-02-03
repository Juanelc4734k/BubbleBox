import React, { useState } from 'react';
import '../../assets/css/layout/post.css';
import { BsHandThumbsUp } from "react-icons/bs";
import { MdOutlineInsertComment } from "react-icons/md";
import { IoArrowRedoOutline } from "react-icons/io5";
import { TiDeleteOutline } from "react-icons/ti";

const Post = ({ post }) => {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
   
    const [imgaiAmplia, setImgAmplia] = useState(null);

    const getAvatarSrc = () => {
        if (post.avatar_usuario) {
            return `http://localhost:3008${post.avatar_usuario}`;
            return `${post.avatar_usuario}`;
        }
        return avatarPorDefecto;
    };

        const imgAbrir = (src) => {
            setImgAmplia(src);
        };

        const imgCerrar = () => {
            setImgAmplia(null);
        }


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
                        <p>{post.titulo}</p>
                        </div>
                       </div>
                    </div>
                    <div className="contenido-post">
                    <p>{post.contenido}</p>
                    {post.imagen && (
    <img
        src={`http://localhost:3008/uploads/${post.imagen}`}  // Usa la ruta relativa almacenada en la base de datos
        alt={post.titulo}
        className="imagen-post"
    />
)}



                    </div>
                    <div className="lineTwo"></div>
                    <div className="aption">
                        <div className="grup1">
                            <div className="reacciones">
                        <BsHandThumbsUp/>
                            </div>
                            <div className="comentarios">
                        <MdOutlineInsertComment/>
                            </div>
                        </div>
                        <div className="grup2">
                            <div className="reenviar">
                        <IoArrowRedoOutline/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {imgaiAmplia && (
                <div className={`contImagenPost ${imgaiAmplia ? 'imagen' :''}`} >

                    <TiDeleteOutline className='salir' onClick={imgCerrar}/>
                    <div className="fondo">

                    <div  className='imgpost'>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <img src={imgaiAmplia} alt="imagen ampliada" />
                    </div>
                    </div>

                </div>
            )}

        </>
        
    );
    
};

export default Post;
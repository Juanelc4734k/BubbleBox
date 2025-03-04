import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../../assets/css/comunity/communityDetail.css'
import {
  getCommunityById,
  getCommunityByPostId,
  getCommunityMembers,
} from "../../services/comunity";

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const data = await getCommunityById(id);
        setCommunity(data);
      } catch (error) {
        console.error("Error al obtener la comunidad", error);
      }
    };


    const fetchCommunityPosts = async () => {
      try {
        const data = await getCommunityByPostId(id);
        setPosts(data);
      } catch (error) {
        console.error("Error al obtener publicaciones de la comunidad", error);
      }
    };

    const fetchCommunityMembers = async () => {
      try {
        const data = await getCommunityMembers(id);
        setMembers(data);
      } catch (error) {
        console.error("Error al obtener los miembros de la comunidad", error);
      }
    };

    fetchCommunityData();
    fetchCommunityPosts();
    fetchCommunityMembers();
  }, [id]);

  if (!community) {
    return <div>Cargando...</div>;
  }

  const getAvatarSrc = () => {
    if (members.avatar_usuario) {
        return members.avatar_usuario.startsWith('http') 
            ? members.avatar_usuario 
            : `http://localhost:3009${members.avatar_usuario}`;
    }
    return avatarPorDefecto;
};

  return (
    <div className="communityDetail">
           <div className="imagenCommunity" >
               {/* icono para salir de la comunidad */}
                <img
                    src={`http://localhost:3004/uploads/${community.imagen}`}
                    alt={community.nombre}
                /> 
            </div> 
        <div className="communityInfo">
            <h1>{community.nombre}</h1>
            <div className="members-section">
                                <h3>Miembros</h3>
                                <div className="members-list">
                                    {members.map(member => (
                                        <div key={member.id} className="member-item">
                                            <img 
                                                src={getAvatarSrc()}
                                                alt={member.nombre}
                                                className="member-avatar"
                                            />
                                            <span>{member.nombre}</span>
                                        </div>
                                    ))}
                                </div>
            </div>
            <span>{members.length} miembros</span>
            <button type="button">Unirme</button>
        </div> 
      <div className="communityPublic">
        <div className="communityPublicConten">
            <div className="communityPublicConten1">
                {/* imagen del usuario para publicar una publicacion en la comunidad */}
                <img/> 
                <textarea name="" id="">Escribe algo...</textarea>
            </div>
            <div className="communityPublicConten2">
                {/* falta icono */}
                <p>Foto</p>
                <p>Video</p>
            </div>
           <div className="communityPublicConten3">
             {/* icono para abrir y cerrar , este contenedor es para la descripcion que se escondera*/}
             <p>{community.descripcion}</p>
           </div>
        </div>

      </div>
      {/* Este es el codigo para las publicaciones de la comunidad */}
      <div className="community-content">
                <div className="posts-section">
                    <h2>Publicaciones</h2>
                    {posts.map(post => (
                        <div key={post.id} className="community-post">
                            <div className="post-header">
                                <img 
                                    src={post.avatar_usuario || avatarPorDefecto}
                                    alt={post.nombre_usuario}
                                    className="user-avatar"
                                />
                                <div className="post-info">
                                    <h3>{post.nombre_usuario}</h3>
                                    <span> {new Date(post.fecha_creacion).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="post-content">
                                <p>{post.contenido}</p>
                                {post.imagen && (
                                    <img 
                                        src={`http://localhost:3008/uploads/${post.imagen}`}
                                        alt="Post content"
                                        className="post-image"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="community-sidebar">
                   
                </div>
            </div>
    </div>
  );
};

export default CommunityDetail;

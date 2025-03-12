import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../../assets/css/comunity/communityDetail.css'
import { FiImage } from "react-icons/fi";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import {
  getCommunityById,
  getCommunityByPostId,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
  isMember
} from "../../services/comunity";
import Swal from 'sweetalert2';

  const CommunityDetail = () => {
  const [isClick, setIsClick] = useState(false);
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [isMemberStatus, setIsMemberStatus] = useState(false);
  const [ isPantallasGrd, setIsPantallasGrd ] = useState(window.innerWidth >=768);
  const userId = parseInt(localStorage.getItem('userId'));
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  
    useEffect(() => {
      const manejo = () =>{
        setIsPantallasGrd(window.innerWidth >=768);
      };

      window.addEventListener("resize", manejo);
      return () => window.removeEventListener("resize", manejo)
    },[]);

    // useEffect(() =>{
    //   if
    // })
  
    useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const communityData = await getCommunityById(id);
        const membershipStatus = await isMember(id, userId);
        setCommunity(communityData);
        console.log(communityData)
        setIsMemberStatus(membershipStatus);
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
  }, [id, userId]);
  const handleMembership = async (e) => {
    e.preventDefault();
    try {
      if (isMemberStatus) {
        await leaveCommunity(id, userId);
        setIsMemberStatus(false);
        // Refresh members list
        const updatedMembers = await getCommunityMembers(id);
        setMembers(updatedMembers);
        Swal.fire({
          icon: 'success',
          title: 'Has dejado la comunidad',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await joinCommunity(id, userId);
        setIsMemberStatus(true);
        // Refresh members list
        const updatedMembers = await getCommunityMembers(id);
        setMembers(updatedMembers);
        Swal.fire({
          icon: 'success',
          title: 'Te has unido a la comunidad',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error al unirse o dejar la comunidad.',
      });
    }
  };
  if (!community) {
    return <div>Cargando...</div>;
  }

const getAvatarSrc = () => {
    // Find the member that matches the current user ID
    const currentMember = members.find(member => member.id === userId);
    
    if (currentMember && currentMember.avatar) {
        return currentMember.avatar.startsWith('http') 
            ? currentMember.avatar 
            : `http://localhost:3009${currentMember.avatar}`;
    }
    return avatarPorDefecto;


};

  return (
    <div className="communityDetail">
      <div className="communityDetail-Conten1">
        
           <div className="imagenCommunity" >
               {/* icono para salir de la comunidad */}
                <img
                    src={`http://localhost:3004/uploads/${community.imagen}`}
                    alt={community.nombre}
                /> 
            </div> 
            <div className="imagenTwo">
                   <img
                    src={`http://localhost:3004/uploads/${community.imagen}`}
                    alt={community.nombre}
                  /> 
            </div>
        <div className="contenCommunity-info">
          <div className="communityInfo">
            <h1>{community.nombre}</h1>
            <p>{members.length} Miembros</p>
        
            <button 
              type="button"
              onClick={handleMembership}
              className= {`uni-De ${isMemberStatus ? 'leave-btn' : 'join-btn'}`}>
              {isMemberStatus ? 'Dejar' : 'Unirme'}
            </button>
            <div className="members-list">
                {members.map(member => (
                    <div key={member.id} className="member-item">
                        <img 
                        src={member.avatar
                          ?(member.avatar.startsWith('http') ? member.avatar : `http://localhost:3009${member.avatar}`):avatarPorDefecto
                          }
                        alt={member.nombre}
                        className="member-avatar"
                        />
                    </div>
                ))}
            </div>
          
            {isPantallasGrd && isMemberStatus && (
            <div className="communityPublicConten3">
              <p className= {`descripcion ${isClick ? "suave" : ""}`}>{community.descripcion}</p>
               <button onClick={() => setIsClick(!isClick)}>
                {isClick ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            )}
        </div>
        </div>
      </div>
      <div className="communityDetail-Conten2">
      {isMemberStatus && (
          <div className="communityPublicConten">
            <div className="communityConten-2">
            <div className="communityPublicConten1">

              <img src={getAvatarSrc()} alt="User avatar"/> 

              <textarea name="" id="" placeholder="Escribe algo..."></textarea>
            </div>
            <div className="communityPublicConten2">
              <FiImage className="IcoCommunity"/>
              <p>Foto /</p>
              <p>Video</p>
            </div>
            </div>
          
            <div className="communityPublicConten3">
              <p className={`descripcion ${isClick ? "suave" : ""}`}>{community.descripcion}</p>
              
              {/* este es el div para las reglas de la comunidad */}
              <div className={`descripcion ? ${isClick ? "suave" : ""}`}>
                <p>reglas</p>
              </div>

              <button onClick={() => setIsClick(!isClick)}>
                {isClick ? <FaChevronUp /> : <FaChevronDown />}
              </button>

            </div>
                
            </div>
      )}
      </div>
      <div className="communityDetail-Conten3">
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
     
    </div>
  );
};

export default CommunityDetail;

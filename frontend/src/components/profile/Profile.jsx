import { useState, useEffect } from "react";
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { TbUserEdit } from "react-icons/tb";
import { FiFlag, FiLock, FiUsers, FiGlobe } from "react-icons/fi";
import ModalReport from "../reports/modalReport";
import UpdateProfile from "./UpdateProfile";
import { getPostByUserId } from "../../services/posts";
import { checkFriendship } from "../../services/friends";
import '../../assets/css/profile/profile.css';
import { CiGrid41 } from "react-icons/ci";
import { updateProfile } from "../../services/users";

function Profile({ profile: initialProfile, isOwnProfile, }) {
  const [profile, setProfile] = useState(initialProfile);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const defaultDescription = "¡Hola! Soy nuevo en BubbleBox y estoy emocionado por conectar con nuevos amigos.";

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile
    }))
  }


  // Check if the current user can view this profile
  useEffect(() => {
    const checkProfileAccess = async () => {
      // If it's the user's own profile, they can always view it
      if (isOwnProfile) {
        setCanViewProfile(true);
        setCheckingAccess(false);
        return;
      }

      // If profile doesn't have privacy settings or is public, anyone can view
      if (!profile.privacidad || profile.privacidad === 'publico') {
        setCanViewProfile(true);
        setCheckingAccess(false);
        return;
      }

      // For private profiles, only the owner can view
      if (profile.privacidad === 'privado') {
        setCanViewProfile(false);
        setCheckingAccess(false);
        return;
      }

      // For friends-only profiles, check friendship status
      if (profile.privacidad === 'amigos') {
        try {
          const loggedUserId = localStorage.getItem('userId');
          if (!loggedUserId) {
            setCanViewProfile(false);
            setCheckingAccess(false);
            return;
          }

          const areFriends = await checkFriendship(loggedUserId, profile.id);
          setIsFriend(areFriends);
          setCanViewProfile(areFriends);
        } catch (error) {
          console.error("Error checking friendship status:", error);
          setCanViewProfile(false);
        }
      }
      
      setCheckingAccess(false);
    };

    if (profile && profile.id) {
      checkProfileAccess();
    }
  }, [profile, isOwnProfile]);

  // Fetch user posts when component mounts
  useEffect(() => {
    if (!isOwnProfile && profile.id && canViewProfile) {
      fetchUserPosts();
    }
  }, [profile.id, isOwnProfile, canViewProfile]);

  // Add this function to render privacy indicator
  const renderPrivacyIndicator = () => {
    console.log('Privacy value:', profile); // Add this line to debug
    
    if (!profile.privacidad) return null;
    
    switch(profile.privacidad) {
      case 'publico':
        return (
          <div className="flex items-center text-green-600 text-sm mt-2">
            <FiGlobe className="mr-1" />
            <span>Perfil público</span>
          </div>
        );
      case 'amigos':
        return (
          <div className="flex items-center text-blue-600 text-sm mt-2">
            <FiUsers className="mr-1" />
            <span>Visible para amigos</span>
          </div>
        );
      case 'privado':
        return (
          <div className="flex items-center text-red-600 text-sm mt-2">
            <FiLock className="mr-1" />
            <span>Perfil privado</span>
          </div>
        );
      default:
        return null;
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const data = await getPostByUserId(profile.id);
      
      // Assuming getPostByUserId returns the data directly
      // If it's an array, use it directly
      if (Array.isArray(data)) {
        setUserPosts(data);
      } 
      // If it's an object with a data property
      else if (data && typeof data === 'object') {
        setUserPosts(Array.isArray(data.data) ? data.data : []);
      } 
      // Otherwise set empty array
      else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error.message);
      setUserPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSrc = () => {
    if (profile.avatar) {
      return `http://localhost:3009${profile.avatar}`;
    }
    return avatarPorDefecto;
  };

  // Render a restricted access message if the user can't view the profile
  if (!isOwnProfile && !canViewProfile && !checkingAccess) {
    return (
      <div className="bg-gradient-to-b profile flex items-center justify-center">
        <div className="mx-auto bg-white rounded-2xl shadow-xl overflow-hidden profileContent p-8 max-w-md">
          <div className="text-center">
            <FiLock className="mx-auto text-red-500" size={48} />
            <h2 className="text-2xl font-semibold mt-4 mb-2">Perfil Privado</h2>
            <p className="text-gray-600">
              {profile.privacidad === 'amigos' 
                ? "Este perfil solo es visible para amigos. Envía una solicitud de amistad para ver el contenido."
                : "Este perfil es privado y no está disponible para visualización."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (checkingAccess) {
    return (
      <div className="bg-gradient-to-b profile">
        <div className="mx-auto bg-white rounded-2xl shadow-xl overflow-hidden profileContent p-8">
          <div className="text-center">
            <p>Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Original return statement with profile content
  return (
    <div className="contenprofile">
      <div className="bg-gradient-to-b profile">
        <div className="mx-auto bg-white rounded-2xl shadow-xl  profileContent">
          <div className="flex flex-col md:flex-row contenedordelprofile">
            {/* Left side - Avatar and Username */}
            <div className="md:w-1/3 bg-[#bda7f1] p-5 contenedorPro">
              <div className="relativeImg">
                <img
                  src={getAvatarSrc()}
                  alt={profile.nombre}
                  className="rounded-full object-cover border-4 border-white shadow-lg imgProfile"
                />
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {profile.username}
              </h2>
              {renderPrivacyIndicator()}
            </div>
            {/* Right side - Profile Information */}
            <div className="md:w-2/3 rightprofile">
              <div className="flex items-center gap-5 textRight" >
                <CiUser className="text-purple-500" size={24} />
                <h1 className="font-bold text-gray-800 textNameP">
                  {profile.nombre}
                </h1>
              </div>
              {/* About Me Section */}
              <div className="sobreMi">
                <div className="tittle-bio">
                <CiUser className="icon-user-profile text-purple-500" size={24} />
                <h3 className="font-semibold text-gray-800 mb-1 textSobe">
                  Biografía
                </h3>
                </div>
                <div className="biografia-text">
                <p className="text-gray-600 textDescription">
                  {profile.descripcion_usuario || defaultDescription}
                </p>
                </div>
              </div>
              {/* General Information */}
              <div className="informacionGeneral">

                <div className="informacion-profile">
                <BsEnvelope size={24} className="icon-email-profile text-purple-500" />
                <h4 className="font-semibold text-gray-800 mb-2 textInfo">
                  Información General
                </h4>
                </div>

                <div className="contenido-informacionGeneral">
                  <div className="flex items-center gap-3 text-gray-600 ml-2">
                    <BsEnvelope size={20} className="text-purple-500" />
                    <span className="text-sm lg:text-lg  ">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 ml-2">
                    <BsGeoAlt size={20} className="text-purple-500" />
                    <span className="text-sm lg:text-lg ">{profile.estado}</span>
                  </div>
                </div>
              </div>

              <div className="intereses-profile">
              {profile.intereses && profile.intereses.length > 0 && (
                  <div className="ineterses">
                    <div className="intereses-tittle">
                    <i className="icon-intereses-heart fa-regular fa-heart text-purple-500"></i>
                    <h4 className="font-semibold text-gray-800 textInteres">
                      Intereses
                    </h4>
                    </div>
                    <div className="intereses-conteen flex flex-wrap gap-2">
                      {profile.intereses.map((interes) => (
                        <span
                          key={interes}
                          className="px-4 py-1 bg-purple-300 text-purple-600 rounded-full text-sm"
                        >
                          {interes}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Update Profile Section */}
              <div className="border-t border-gray-200 butonprofil">
                {isOwnProfile ? (
                  <UpdateProfile onProfileUpdate={handleProfileUpdate} />
                ) : (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 mt-4"
                  >
                    <FiFlag />
                    <span>Reportar usuario</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Posts Section - Completely separate from profile */}
      {!isOwnProfile && (
        <div className="posts-container">
          <div className="posts-section">
            <h3 className="text-xl font-semibold text-gray-800 mb-4"> <CiGrid41/> Publicaciones Recientes</h3>
            {loading ? (
              <p className="text-center text-gray-500">Cargando publicaciones...</p>
            ) : userPosts.length > 0 ? (
              <div className="publiAmigo">
                {userPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg shadow-sm publiAmigoDivi">
                    <p className="textPublifecha">{new Date(post.fecha_creacion).toLocaleDateString()}</p>
                    <h4 className="textTituloProfile">{post.titulo}</h4>
                    <p className="textContenidoPerfil">{post.contenido}</p>
                    {post.imagen && (
                      <img 
                        src={`http://localhost:3008/uploads/${post.imagen}`} 
                        alt="Post" 
                        className="imgOubliProfile"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="noPubliPerfil">Este usuario aún no tiene publicaciones.</p>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ModalReport
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={profile.id}
        contentType="usuario"
        reportedUserId={profile.id}
      />
    </div>
  );
}

export default Profile;
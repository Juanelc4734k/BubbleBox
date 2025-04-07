import { useState, useEffect } from "react";
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { TbUserEdit } from "react-icons/tb";
import { FiFlag, FiLock, FiUsers, FiGlobe } from "react-icons/fi";
import ModalReport from "../reports/modalReport";
import UpdateProfile from "./UpdateProfile";
import { getPostByUserId } from "../../services/posts";
import { checkFriendship } from "../../services/friends";
import "../../assets/css/profile/profile.css";
import { CiGrid41 } from "react-icons/ci";
import { updateProfile } from "../../services/users";

function Profile({ profile: initialProfile, isOwnProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const defaultDescription =
    "¡Hola! Soy nuevo en BubbleBox y estoy emocionado por conectar con nuevos amigos.";

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      ...updatedProfile,
    }));
  };

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
      if (!profile.privacidad || profile.privacidad === "publico") {
        setCanViewProfile(true);
        setCheckingAccess(false);
        return;
      }

      // For private profiles, only the owner can view
      if (profile.privacidad === "privado") {
        setCanViewProfile(false);
        setCheckingAccess(false);
        return;
      }

      // For friends-only profiles, check friendship status
      if (profile.privacidad === "amigos") {
        try {
          const loggedUserId = localStorage.getItem("userId");
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
    // Add this line to debug

    if (!profile.privacidad) return null;

    switch (profile.privacidad) {
      case "publico":
        return (
          <div className="flex items-center text-green-600 text-sm mt-2">
            <FiGlobe className="mr-1" />
            <span>Perfil público</span>
          </div>
        );
      case "amigos":
        return (
          <div className="flex items-center text-blue-600 text-sm mt-2">
            <FiUsers className="mr-1" />
            <span>Visible para amigos</span>
          </div>
        );
      case "privado":
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
      else if (data && typeof data === "object") {
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
              {profile.privacidad === "amigos"
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
    <div className="containerProfile">
      <div className="subContainerProfile">
        <div className="containerProfileLeft">
          <div className="containerImgProfile">
            <img
              src={getAvatarSrc()}
              alt={profile.nombre}
              className="imgProfile"
            />
          </div>
          <h2 className="usernameProfile">
            {profile.username}
          </h2>
          {renderPrivacyIndicator()}
        </div> 
        <div className="containerProfileRight">
          <div className="textRight" >
            <i className="fa-regular fa-user text-purple-500"></i>
            <h1 className="textNameP">
                {profile.nombre.length > 40
                ? profile.nombre.substring(0, 40) + "..." 
                : profile.nombre}
            </h1>
          </div>
          <div className="containerInformation">
            <div className="tittle-bio">
            <i className="fas fa-feather-alt"></i>
              <h3 className="textSobe">
                Biografía
              </h3>
            </div>
            <div className="biografia-text">
              <p className="textDescription">
                {profile.descripcion_usuario || defaultDescription}
              </p>
            </div>
          </div>
          <div className="containerInformacionGeneral">
            <div className="informacion-profile">
              <i className="fa-regular fa-pen-to-square"></i>
              <h4 className="textInfo">
                Información General
              </h4>
            </div>
            <div className="contenido">
              <div className="contenidoEmail">
              <i className="fa-regular fa-envelope text-purple-500"></i>
                <span className="textEmail">{profile.email}</span>
              </div>
              <div className="contenidoEstado">
                <i className="fa-regular fa-user text-purple-500"></i>
                <span className="textEstado">{profile.estado}</span>
              </div>
            </div>
            <div className="intereses-profile">
            <div className="intereses">
              <div className="intereses-tittle">
                <i className="icon-intereses-heart fa-regular fa-heart text-purple-500"></i>
                <h4 className="textInteres">Intereses</h4>
              </div>
              <div className="intereses-conteen">
                {profile.intereses.length > 0 ? (
                  profile.intereses.map((interes) => (
                    <span key={interes} className="itemsIntereses">
                      {interes}
                    </span>
                  ))
                ) : (
                  <span className="itemsIntereses">
                    Aún no tiene intereses
                  </span>
                )}
              </div>
            </div>

            </div>
          </div>
          <div className="butonprofil">
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

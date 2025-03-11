import { useState, useEffect } from "react";
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { TbUserEdit } from "react-icons/tb";
import { FiFlag } from "react-icons/fi";
import ModalReport from "../reports/modalReport";
import UpdateProfile from "./UpdateProfile";
import { getPostByUserId } from "../../services/posts";
import '../../assets/css/profile/profile.css';

function Profile({ profile, isOwnProfile }) {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const defaultDescription = "¡Hola! Soy nuevo en BubbleBox y estoy emocionado por conectar con nuevos amigos.";

  // Fetch user posts when component mounts
  useEffect(() => {
    if (!isOwnProfile && profile.id) {
      fetchUserPosts();
    }
  }, [profile.id, isOwnProfile]);

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
  console.log(profile);

  return (
    <>
      <div className="bg-gradient-to-b profile">
        <div className="mx-auto bg-white rounded-2xl shadow-xl overflow-hidden profileContent">
          <div className="flex flex-col md:flex-row dentroProfileConent">
            {/* Left side - Avatar and Username */}
            <div className="md:w-1/3 bg-[#bda7f1] p-5 lg:pt-18 flex flex-col items-center">
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
            </div>

            {/* Right side - Profile Information */}
            <div className="md:w-2/3 p-6 rightprofile">
              <div className="flex items-center gap-5 textRight">
                <CiUser className="text-purple-500" size={24} />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  {profile.nombre}
                </h1>
              </div>

              {/* About Me Section */}
              <div className="sobreMi">
                <h3 className="font-semibold text-gray-800 mb-1 textSobe">
                  Sobre mi
                </h3>
                <p className="text-gray-600 text-sm lg:text-lg ">
                  {profile.descripcion_usuario || defaultDescription}
                </p>
              </div>

              {/* General Information */}
              <div className="informacionGeneral">
                <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">
                  Información General
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <BsEnvelope size={20} className="text-purple-500" />
                    <span className="text-sm lg:text-lg  ">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <BsGeoAlt size={20} className="text-purple-500" />
                    <span className="text-sm lg:text-lg ">{profile.estado}</span>
                  </div>
                </div>
                {profile.intereses && profile.intereses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">
                      Intereses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.intereses.map((interes) => (
                        <span
                          key={interes}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
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
                  <UpdateProfile />
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Publicaciones</h3>
            {loading ? (
              <p className="text-center text-gray-500">Cargando publicaciones...</p>
            ) : userPosts.length > 0 ? (
              <div className="grid gap-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">{new Date(post.fecha_creacion).toLocaleDateString()}</p>
                    <h4 className="font-medium text-gray-800">{post.titulo}</h4>
                    <p className="text-gray-600 mt-2">{post.contenido}</p>
                    {post.imagen && (
                      <img 
                        src={`http://localhost:3008/uploads/${post.imagen}`} 
                        alt="Post" 
                        className="mt-3 rounded-md max-h-48 w-auto"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Este usuario aún no tiene publicaciones.</p>
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
    </>
  );
}

export default Profile;
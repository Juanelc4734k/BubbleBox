import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../assets/css/comunity/communityDetail.css";
import { FiImage } from "react-icons/fi";
import { FaChevronUp, FaChevronDown, FaUserTag } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { MdPostAdd } from "react-icons/md";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { FiFlag } from "react-icons/fi";
import { FaRegClipboard } from "react-icons/fa6";

import ModalReport from "../reports/modalReport";

import {
  getCommunityById,
  getCommunityByPostId,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
  isMember,
} from "../../services/comunity";
import { createPostCommunity } from "../../services/posts";
import Swal from "sweetalert2";

const CommunityDetail = () => {
  const [isClickDescri, setIsClickDescri] = useState(true);
  const [isClickReglas, setIsClickReglas] = useState(true);
  const [isClick, setIsClick] = useState(true);
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [isMemberStatus, setIsMemberStatus] = useState(false);
  const [postContent, setPostContent] = useState("");
  // Add these states at the top of your component

  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const userId = localStorage.getItem("userId")
    ? parseInt(localStorage.getItem("userId"))
    : null;
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const communityData = await getCommunityById(id);
        const membershipStatus = await isMember(id, userId);
        setCommunity(communityData);

        setIsMemberStatus(membershipStatus);
      } catch (error) {
        console.error("Error al obtener la comunidad", error);
      }
    };

    const fetchCommunityPosts = async () => {
      try {
        const data = await getCommunityByPostId(id);
        setPosts((prevPosts) => {
          return data.map((post) => {
            const existingPost = prevPosts.find((p) => p.id === post.id);
            return {
              ...post,
              bgColor: post.imagen
                ? null
                : existingPost?.bgColor || generateRandomColor(),
            };
          });
        });
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
    if (community.id_creador === userId) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "No puedes abandonar una comunidad que has creado",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    e.preventDefault();
    try {
      if (isMemberStatus) {
        await leaveCommunity(id, userId);
        setIsMemberStatus(false);
        // Refresh members list
        const updatedMembers = await getCommunityMembers(id);
        setMembers(updatedMembers);
        Swal.fire({
          icon: "success",
          title: "Has dejado la comunidad",
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
          icon: "success",
          title: "Te has unido a la comunidad",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ha ocurrido un error al unirse o dejar la comunidad.",
      });
    }
  };
  if (!community) {
    return <div>Cargando...</div>;
  }

  const getAvatarSrc = () => {
    // Find the member that matches the current user ID
    const currentMember = members.find((member) => member.id === userId);

    if (currentMember && currentMember.avatar) {
      return currentMember.avatar.startsWith("http")
        ? currentMember.avatar
        : `http://localhost:3009${currentMember.avatar}`;
    }
    return avatarPorDefecto;
  };

  // Add this function to handle mentions
  const handleTextareaChange = (e) => {
    const text = e.target.value;
    const lastWord = text.split(" ").pop();

    if (lastWord.startsWith("@")) {
      const search = lastWord.slice(1);
      setMentionSearch(search);
      const filtered = members.filter((member) =>
        member.nombre.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMembers(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionClick = (member) => {
    const text = postContent;
    const words = text.split(" ");
    words.pop();
    const mentionSpan = `@${member.nombre}`;
    const newText = [...words, mentionSpan, ""].join(" ");
    setPostContent(newText); // Use state setter instead of directly modifying textarea
    setShowMentions(false);
  };

  const handleMentionButtonClick = () => {
    const newContent = postContent + "@";
    setPostContent(newContent);
    setShowMentions(true);
    // Filter all members initially when @ is added
    setFilteredMembers(members);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePostWithImage = async () => {
    if (!postContent.trim() && !selectedImage) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Por favor escribe algo o selecciona una imagen",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("contenido", postContent.trim());
      formData.append("idUsuario", userId);
      formData.append("idComunidad", id);
      if (selectedImage) {
        formData.append("imagen", selectedImage);
      }

      await createPostCommunity(formData);

      const updatedPosts = await getCommunityByPostId(id);
      setPosts(updatedPosts);

      setPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Publicación creada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la publicación",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Por favor escribe algo para publicar",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const postData = {
        contenido: postContent,
        idUsuario: parseInt(userId),
        idComunidad: parseInt(id),
      };

      await createPostCommunity(postData);

      // Obtener las publicaciones actualizadas
      const updatedPosts = await getCommunityByPostId(id);

      setPosts((prevPosts) => {
        return updatedPosts.map((post) => {
          const existingPost = prevPosts.find((p) => p.id === post.id);

          return {
            ...post,
            bgColor: post.imagen
              ? null
              : existingPost?.bgColor || generateRandomColor(),
          };
        });
      });

      // Limpiar el textarea
      setPostContent("");

      Swal.fire({
        icon: "success",
        title: "Publicación creada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la publicación",
      });
    }
  };

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="communityDetail">
      <div className="communityDetail-Conten1">
        <div className="imagenCommunity">
          {/* icono para salir de la comunidad */}
          <img
            src={`http://localhost:3004/uploads/${community.banner}`}
            alt={community.nombre}
          />
        </div>
        <div className="imagenTwo">
          <img
            src={`http://localhost:3004/uploads/${community.avatar}`}
            alt={community.nombre}
          />
        </div>
        <div className="contenCommunity-info">
          <div className="communityInfo">
            <h1>{community.nombre}</h1>
            <p>{members.length} Miembros</p>

            <div className="community-actions">
              {community.id_creador !== userId && (
                <button
                  type="button"
                  onClick={handleMembership}
                  className={`uni-De ${
                    isMemberStatus ? "leave-btn" : "join-btn"
                  }`}
                >
                  {isMemberStatus ? "Dejar" : "Unirme"}
                </button>
              )}

              {/* Add report button */}
              {community.id_creador !== userId && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="report-btn"
                >
                  <FiFlag />
                  <span>Reportar</span>
                </button>
              )}
            </div>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-item">
                  <img
                    src={
                      member.avatar
                        ? member.avatar.startsWith("http")
                          ? member.avatar
                          : `http://localhost:3009${member.avatar}`
                        : avatarPorDefecto
                    }
                    alt={member.nombre}
                    className="member-avatar"
                  />
                </div>
              ))}
            </div>
            <div className="DescripcionButton">
              <div className="complement-button">
                <div className="infoCo">
                  <div className="ico-community-tittle">
                    <FaRegClipboard />
                  </div>
                  <p>Descripción</p>
                </div>
                <div className="buton-description">
                  <button
                    onClick={() => setIsClickDescri(!isClickDescri)}
                    className="toggle-button"
                  >
                    {isClickReglas ? <FaChevronDown /> : <FaChevronUp />}
                  </button>
                </div>
              </div>

              <div className={`info-block ${!isClickDescri ? "expanded" : ""}`}>
                <div
                  className={`descripcion ${!isClickDescri ? "expanded" : ""}`}
                >
                  {community.descripcion}
                </div>
              </div>
            </div>

            <div className="reglas-communidad">
              <div className="complement-button">
                <div className="infoRegla">
                  <div className="ico-community-tittle">
                    <IoShieldCheckmarkOutline />
                  </div>
                  <p>Reglas de la comunidad</p>
                </div>

                <div className="buton-reglass">
                  <button
                    onClick={() => setIsClickReglas(!isClickReglas)}
                    className="toggle-button"
                  >
                    {isClickReglas ? <FaChevronDown /> : <FaChevronUp />}
                  </button>
                </div>
              </div>

              <div className={`info-block ${!isClickReglas ? "expanded" : ""}`}>
                <h3>Reglas de la comunidad</h3>
                <div className={`reglas ${!isClickReglas ? "expanded" : ""}`}>
                  {community.reglas &&
                    JSON.parse(community.reglas).map((rule, index) => (
                      <div key={index} className="rule-item">
                        <span className="rule-number">{index + 1}.</span>
                        <p>{rule}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="communityDetail-Conten2">
        {isMemberStatus && (
          <div className="communityPublicConten">
            <div className="communityConten-2">
              <div className="communityPublicConten1">
                <img src={getAvatarSrc()} alt="User avatar" />
                <div className="textarea-container">
                  <textarea
                    placeholder="¿Qué quieres compartir con la comunidad?"
                    value={postContent}
                    onChange={(e) => {
                      setPostContent(e.target.value);
                      handleTextareaChange(e);
                    }}
                    rows="3"
                  >
                    {" "}
                  </textarea>
                  {showMentions && filteredMembers.length > 0 && (
                    <div className="mentions-dropdown">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className="mention-item"
                          onClick={() => handleMentionClick(member)}
                        >
                          <img
                            src={
                              member.avatar
                                ? member.avatar.startsWith("http")
                                  ? member.avatar
                                  : `http://localhost:3009${member.avatar}`
                                : avatarPorDefecto
                            }
                            alt={member.nombre}
                          />
                          <span>{member.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="post-actions">
                <div className="media-button-group">
                  <button
                    className="media-button"
                    onClick={() => setShowModal(true)}
                  >
                    <FiImage className="IcoCommunity" />
                    <span>Foto / Video</span>
                  </button>
                  <button
                    className="media-button"
                    onClick={handleMentionButtonClick}
                  >
                    <FaUserTag className="IcoCommunity" />
                    <span>Mencionar</span>
                  </button>
                </div>

                <button
                  className="post-button"
                  onClick={() => handleCreatePost()}
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="communityDetail-Conten2-modal">
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div className="Info-header">
                  <span>
                    {" "}
                    <MdPostAdd />{" "}
                  </span>
                  <h3>Crear publicación</h3>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setPostContent("");
                  }}
                >
                  {" "}
                  <IoCloseOutline />{" "}
                </button>
              </div>
              <div className="modal-body">
                <p>Descripción</p>
                <textarea
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows="3"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                  id="image-input"
                />
                <label htmlFor="image-input" className="image-upload-button">
                  <span>
                    <FiImage />
                  </span>{" "}
                  Seleccionar imagen
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <IoCloseOutline />{" "}
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setPostContent("");
                  }}
                >
                  Cancelar
                </button>
                <button onClick={handleCreatePostWithImage}>Publicar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="communityDetail-Conten3">
        <div className="community-content">
          <div className="posts-section">
            <h2>Publicaciones</h2>
            <div className="conten-Post-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`community-post ${
                    post.imagen ? "with-image" : "no-image"
                  }`}
                >
                  <div className="post-header">
                    <div className="post-header-left">
                      <img
                        src={
                          post.avatar_usuario
                            ? `http://localhost:3009${post.avatar_usuario}`
                            : avatarPorDefecto
                        }
                        alt={post.nombre_usuario}
                        className="user-avatar"
                      />
                      <div className="post-info">
                        <span className="post-date">
                          {new Date(post.fecha_creacion).toLocaleString()}
                        </span>
                        <h3>{post.nombre_usuario}</h3>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`post-content ${
                      post.imagen ? "with-image" : ""
                    }`}
                  >
                    <p
                      className="post-text"
                      style={
                        post.imagen
                          ? {}
                          : {
                              backgroundColor: post.bgColor,
                              display: "inline-block",
                              padding: "5px 10px",
                              borderRadius: "5px",
                            }
                      }
                    >
                      {post.contenido}
                    </p>
                    {post.imagen && (
                      <div className="post-image-container">
                        <img
                          src={`http://localhost:3008/uploads/${post.imagen}`}
                          alt="Post content"
                          className="post-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Add Modal Report component */}
      <ModalReport
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={community?.id}
        contentType="comunidad"
        reportedUserId={community?.id_creador}
      />
    </div>
  );
};

export default CommunityDetail;

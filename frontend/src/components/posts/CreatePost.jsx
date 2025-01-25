// Componente CreatePost.js
import React, { useEffect, useState } from "react";
import { createPost } from "../../services/posts";
import { CiCirclePlus, CiImageOn } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import "../../assets/css/posts/createPost.css";
import * as jwt_decode from "jwt-decode";

const CreatePost = () => {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [openPost, setOpenPost] = useState(false);
  const [idUsuario, setIdUsuario] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwt_decode.jwtDecode(token);
          setIdUsuario(decoded.userId);
        }
      } catch (error) {
        console.error("Error al obtener el id del usuario:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const togglePost = () => {
    setOpenPost(!openPost);
    if (!openPost) {
      // Resetear el formulario al abrirlo
      setTitulo("");
      setContenido("");
      setImagen(null);
      setImagenPreview(null);
      setMensaje("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!titulo || !contenido) {
      setMensaje("Por favor, completa todos los campos");
      return;
    }

    const postData = new FormData();
    postData.append("titulo", titulo.trim());
    postData.append("contenido", contenido);
    if (imagen) {
      postData.append("imagen", imagen);
    }
    if (idUsuario) {
      postData.append("idUsuario", idUsuario);
    }

    try {
      const response = await createPost(postData);
      setMensaje("Publicación creada exitosamente");
      setTimeout(() => {
        togglePost();
      }, 2000);
    } catch (error) {
      setMensaje("Error al crear la publicación");
      console.error("Error:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`create-post ${openPost ? "active" : ""}`}>
      <button className="create-post-button" onClick={togglePost}>
        <CiCirclePlus className="icono0" />
        <span>Nueva Publicación</span>
      </button>
      {openPost && (
        <div className="formPost">
          <div className="form-header">
            <h2><CiCirclePlus className="iconoPublicacion" /> Crear Publicación</h2>
            <button className="close-button" onClick={togglePost}>
              <IoClose />
            </button>
          </div>
          {mensaje && (
            <p className={`mensaje ${mensaje.includes("error") ? "error" : "success"}`}>{mensaje}</p>
          )}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la publicación"
                required
              />
            </div>
            <div className="form-group">
              <textarea
                id="contenido"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="¿Qué estás pensando?"
                rows={5}
                required
              />
            </div>
            <div className="form-group file-input">
              <input type="file" id="imagen" accept="image/*" onChange={handleFileChange} className="hidden-input" />
              <label htmlFor="imagen" className="file-label">
                <CiImageOn />
                <span>Agregar imagen</span>
              </label>
              {imagenPreview && (
                <div className="image-preview">
                  <img src={imagenPreview || "/placeholder.svg"} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setImagen(null);
                      setImagenPreview(null);
                        // Reiniciar el input de archivo
                        const fileInput = document.getElementById("imagen");
                        if (fileInput) {
                        fileInput.value = ""; // Esto permite volver a cargar la misma imagen
                        }
                    }}
                  >
                    <IoClose />
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="submit-button">
              Publicar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreatePost;

import React, { useEffect, useState, useRef, useCallback } from "react"
import { createPost } from "../../services/posts"
import { CiCirclePlus, CiImageOn } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import "../../assets/css/posts/createPost.css"
import * as jwt_decode from "jwt-decode"
import DOMPurify from "dompurify";

const CreatePost = () => {
  const [titulo, setTitulo] = useState("")
  const [contenido, setContenido] = useState("")
  const [imagen, setImagen] = useState(null)  
  const [mensaje, setMensaje] = useState("")
  const [openPost, setOpenPost] = useState(false)
  const [idUsuario, setIdUsuario] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [animateMessage, setAnimateMessage] = useState(false)
  const [showBubbles, setShowBubbles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);


  const scrollableRef = useRef(null); 
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input);
  };

  // Función para ajustar automáticamente la altura del textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Restablece la altura
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Ajusta a la altura del contenido
    }
  };
  useEffect(() => {
    adjustTextareaHeight();
  }, [contenido]); // Llama a la función cada vez que el contenido cambie

  const combinedRef = useCallback((node) => {
    if (node) {
      modalRef.current = node;
      scrollableRef.current = node;
    }
  }, []);

  useEffect(() => {
    // Detectar clics fuera del modal
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setOpenPost(false);
        }
    };
    if (openPost) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [openPost]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const decoded = jwt_decode.jwtDecode(token)
          setIdUsuario(decoded.userId)
        }
      } catch (error) {
        console.error("Error al obtener el id del usuario:", error)
      }
    }
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (mensaje) {
      setAnimateMessage(true)
      const timer = setTimeout(() => {
        setAnimateMessage(false)
      }, 2000) // Duration of the animation
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  useEffect(() => {
    if (mensaje) {
      setMensaje(""); 
    }
  }, [titulo, contenido]);

  const togglePost = () => {
    setOpenPost(!openPost)
    if (!openPost) {
      setTitulo("")
      setContenido("")
      setImagen(null)
      setImagenPreview(null)
      setMensaje("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return; // Evita múltiples clics

    setIsSubmitting(true); // Desactiva el botón mientras se envía
    setMensaje("")

    if (!titulo || !contenido) {
      setMensaje("Error, Por favor completa todos los campos");
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0;
      }
      setTimeout(() => {
        setMensaje("");
      }, 3000);
      setIsSubmitting(false); // Reactiva el botón
      return
    }

    // Sanitizar título y contenido
    const sanitizedTitulo = sanitizeInput(titulo.trim());
    const sanitizedContenido = sanitizeInput(contenido);

    const postData = new FormData()
    postData.append("titulo", sanitizedTitulo)
    postData.append("contenido", sanitizedContenido)
    if (imagen) {
      postData.append("imagen", imagen)
    }
    if (idUsuario) {
      postData.append("idUsuario", idUsuario)
    }

    try {
      const response = await createPost(postData)
      setMensaje("Publicación creada exitosamente");
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0;
      }
      setShowBubbles(true)
      setTimeout(() => {
        setShowBubbles(false);
        togglePost();
      }, 800);
    } catch (error) {
      setMensaje("Error al crear la publicación");
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0;
      }
      setTimeout(() => {
        togglePost();
      }, 1000);
      console.error("Error: ", error);
    }finally {
      setIsSubmitting(false); // Reactiva el botón después de la petición
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const createBubbles = () => {
    return Array.from({ length: 10 }).map((_, index) => {
      const style = {
        left: `${Math.random() * 90 + 5}%`, // Evita valores extremos en los bordes
      "--tx": `${(Math.random() - 0.5) * 40}px`, // Movimiento horizontal más suave
      "--ty": `${-100 - Math.random() * 100}px`, // Asegura que suban más uniformemente
      animationDelay: `${Math.random() * 1}s`, // Aumenta la variación del delay
      }
      return <div key={index} className="bubble" style={style}></div>
    })
  }

  return (
    <div className={`create-post ${openPost ? "active" : ""}`}>
      <button className="create-post-button" onClick={togglePost}>
        <CiCirclePlus className="icono0" />
        <span>Publicación</span>
      </button>
      {openPost && (
        <div className="modal-overlay">
          <div  ref={combinedRef} className="formPost">
            <div className="form-header">
              <h2 className="textPubli">
                <CiCirclePlus className="iconoPublicacion" /> Crear Publicación
              </h2>
              <button className="close-buttonPos" onClick={togglePost}>
                <IoClose />
              </button>
            </div>
            {mensaje && (
              <div className={`mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>
                {mensaje}
                {showBubbles && createBubbles()}
              </div>
            )}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título de la publicación"
                  min={20}
                />
              </div>
              <div className="form-group">
                <textarea
                  id="contenido"
                  value={contenido}
                  ref={textareaRef} // Referencia al textarea
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="¿Qué estás pensando?"
                  rows={1}
                  style={{ overflow: "hidden", resize: "none" }}
                  maxLength={150}
                />
              </div>
              <div className="form-group file-input">
                <input type="file" id="imagen" accept="image/*" onChange={handleFileChange} className="hidden-input" />
                <label htmlFor="imagen" className="file-label">
                  <CiImageOn />
                  <span>Agregar imagen</span>
                </label>
                {imagenPreview && (
                  <div className="image-preview-Post">
                    <img src={imagenPreview || "/placeholder.svg"} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-post"
                      onClick={() => {
                        setImagen(null)
                        setImagenPreview(null)
                        const fileInput = document.getElementById("imagen")
                        if (fileInput) {
                          fileInput.value = ""
                        }
                      }}
                    >
                      <IoClose />
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Subiendo..." : "Publicar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePost;

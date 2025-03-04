import { useEffect, useState, useRef, useCallback } from "react"
import * as jwt_decode from "jwt-decode"
import { CiBookmarkPlus, CiImageOn } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { MdTextFields } from "react-icons/md"
import { createStorieMulti, createStorieText } from "../../services/stories"
import TextStories from "./TextStories"
import "../../assets/css/stories/createStories.css"

const CreateStories = () => {
  const [text, setText] = useState("")
  const [media, setMedia] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState("")
  const [idUsuario, setIdUsuario] = useState(null)
  const [openStories, setOpenStories] = useState(false)
  const scrollableRef = useRef(null)
  const [textModal, setTextModal] = useState(false)
  const [isStoriesSub, setIsStoriesSub] = useState(false);
  
  const modalRef = useRef(null);

      // Combinar ambas referencias en una sola función de ref
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
            setOpenStories(false);
        }
    };

    if (openStories) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [openStories]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const decoded = jwt_decode.jwtDecode(token)
          setIdUsuario(decoded.userId)
        }
      } catch (error) {
        console.error("Error al obtener el id del usuario: ", error)
      }
    }
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const toggleStories = () => {
    setOpenStories(!openStories)
    if (!openStories) {
      setMedia(null)
      setText("")
      setPreview(null)
      setMessage("")
      setTextModal(false)
    }
  }
  const handleSubmitStories = async (e) => {
    e.preventDefault()
    if(isStoriesSub)return;
    setIsStoriesSub(true);
    setMessage("")
  
    if (!idUsuario) {
      setMessage("Error: Usuario no autenticado")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      return
    }
  
    try {
      if (textModal && text) {
        await createStorieText(idUsuario, text)
      } else if (media) {
        await createStorieMulti(idUsuario, media)
      } else {
        setMessage("Error: Por favor inserta un texto o una imagen")
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = 0
        }
        setTimeout(() => {
          setMessage("");
        }, 3000);
        setIsStoriesSub(false);
        return
      }
      
      setMessage("Historia creada exitosamente")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      setTimeout(() => {
        toggleStories()
      }, 2000)
    } catch (error) {
      setMessage("Error al crear la historia")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      setTimeout(() => {
        toggleStories()
      }, 2000)
      console.error("Error: ", error)
    } finally {
      setIsStoriesSub(false);
    }
}
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMedia(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setMedia(null)
    setPreview(null)
    const fileInput = document.getElementById("imgStories")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  return (
    <div className={`createStories ${openStories ? "active" : ""}`}>
      <button className="openStoriesButton" onClick={toggleStories}>
        <CiBookmarkPlus className="icono000" />
        <span>Historia</span>
      </button>
      {openStories && (
        <div className="modal-overlay">
          <div ref={combinedRef} className="formStories">
            <div className="formheaderstories">
              <h2 className="textForm">
                <CiBookmarkPlus className="iconoHistoria" /> Crear Historia{" "}
              </h2>
              <button className="closeStories" onClick={toggleStories}>
                <IoClose />
              </button>
            </div>
            {message && (
              <div className={`mensajeStories ${message.includes("Error") ? "error" : "success"}`}>{message}</div>
            )}
            <form onSubmit={handleSubmitStories} encType="multipart/form-data">
              <div className="modeToggle">
                <button
                  type="button"
                  className={`modeButton ${!textModal ? "active" : ""}`}
                  onClick={() => setTextModal(false)}
                >
                  <CiImageOn className="iconButton" /> Archivo
                </button>
                <button
                  type="button"
                  className={`modeButton ${textModal ? "active" : ""}`}
                  onClick={() => setTextModal(true)}
                >
                  <MdTextFields className="iconButton" /> Texto
                </button>
              </div>
              {textModal ? (
                <TextStories text={text} setText={setText} idUsuario={idUsuario} />
              ) : (
                <div className="formInputMedia">
                  <input
                    type="file"
                    id="imgStories"
                    accept="image/*, video/*"
                    className="mediaInput"
                    onChange={handleFileChange}
                  />
                  {preview ? (
                    <>
                      {media?.type.startsWith('video/') ? (
                        <video 
                          className="previewImage" 
                          src={preview} 
                          controls
                        />
                      ) : (
                        <img 
                          className="previewImage" 
                          src={preview || "/placeholder.svg"} 
                          alt="Preview" 
                        />
                      )}
                      <button type="button" className="remove-image-button" onClick={removeImage}>
                        <IoClose />
                      </button>
                    </>
                  ) : (
                    <CiImageOn className="multimedia" />
                  )}
                </div>
              )}
              <button type="submit" className="buttonSubmit" disabled={isStoriesSub}>
                {isStoriesSub ? "Cargando..." : "Crear Historia"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateStories


"use client"

import { useEffect, useState, useRef } from "react"
import * as jwt_decode from "jwt-decode"
import { CiBookmarkPlus, CiImageOn } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { MdTextFields } from "react-icons/md"
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
    setMessage("")

    if (!text && !media) {
      setMessage("Error: Por favor inserta un texto o una imagen")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      return
    }

    const storiesData = new FormData()
    if (text) storiesData.append("contenido", text.trim())
    if (media) storiesData.append("media", media)

    try {
      // Placeholder for API call
      // const response = await CreateStories(storiesData);
      setMessage("Historia creada exitosamente")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      setTimeout(() => {
        toggleStories()
      }, 3000)
    } catch (error) {
      setMessage("Error al crear la publicación")
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0
      }
      console.error("Error: ", error)
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
        <span>Nueva Historia</span>
      </button>
      {openStories && (
        <div ref={scrollableRef} className="formStories">
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
              <TextStories text={text} setText={setText} />
            ) : (
              <div className="formInputMedia">
                <input
                  type="file"
                  id="imgStories"
                  accept="image/*"
                  className="mediaInput"
                  onChange={handleFileChange}
                />
                {preview ? (
                  <>
                    <img className="previewImage" src={preview || "/placeholder.svg"} alt="Preview" />
                    <button type="button" className="remove-image-button" onClick={removeImage}>
                      <IoClose />
                    </button>
                  </>
                ) : (
                  <CiImageOn className="multimedia" />
                )}
              </div>
            )}
            <button type="submit" className="buttonSubmit">
              Crear Historia
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default CreateStories


import { useState, useEffect, useRef } from "react"
import { getProfiles, updateProfile } from "../../services/users"
import "../../assets/css/profile/updateProfile.css"
import { TbUserEdit } from "react-icons/tb"
import { IoClose } from "react-icons/io5"
import { FaCamera } from "react-icons/fa"

const UpdateProfile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfiles()
        setProfile((prevProfile) => ({
          ...prevProfile,
          ...userData,
          newPassword: "",
          confirmPassword: "",
        }))
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error)
      }
    }
    fetchProfile()
  }, [])

  const toggleModal = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile((prevProfile) => ({
          ...prevProfile,
          avatar: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (profile.newPassword !== profile.confirmPassword) {
      setMessage("Las contraseñas no coinciden")
      return
    }
    try {
      await updateProfile(profile)
      setMessage("Perfil actualizado con éxito")
      setTimeout(() => {
        setMessage("")
        toggleModal()
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      setMessage("Error al actualizar tu perfil")
    }
  }

  return (
    <div className={`containerUpdateProfile ${isOpen ? "active" : ""}`}>
      <button className="w-full md:w-auto px-5 lg:px-7 lg:py-2  py-1 bg-[#bda7f1] text-white rounded-3xl hover:bg-[#866bb8] transition-colors flex items-center justify-center gap-2 text-lg font-medium" onClick={toggleModal}>
        <TbUserEdit className="icon" />
        Actualizar
      </button>

      <div className="fromUpdate">
        <div className="form-header">
          <h2>Actualiza Tu perfil</h2>
          <button className="close-button" onClick={toggleModal}>
            <IoClose />
          </button>
        </div>
        {message && <p className={`message ${message.includes("éxito") ? "success" : "error"}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="imgProfile">
            <div className="avatar-container">
              <img src={profile.avatar || "/placeholder.svg"} alt="Profile" className="avatar" />
              <button type="button" className="change-avatar" onClick={() => fileInputRef.current.click()}>
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              value={profile.nombre}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <textarea
              id="contenido"
              rows={3}
              className="texttarea"
            />
          </div>
          <button type="submit" className="submit-button">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateProfile


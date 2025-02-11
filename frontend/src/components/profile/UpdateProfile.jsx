import { useState, useEffect } from "react"
import { getProfiles, updateProfile } from "../../services/users"
import "../../assets/css/profile/updateProfile.css"
import { TbUserEdit } from "react-icons/tb"
import { IoClose } from "react-icons/io5"

const UpdateProfile = () => {
  const [openUpdate, setOpenUpdate] = useState(false)
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar: "",
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfiles()
        setProfile(userData)
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error)
      }
    }
    fetchProfile()
  }, [])

  const toggleOpenUpdate = () => {
    setOpenUpdate(!openUpdate)
    if (!openUpdate) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profile)
      setMessage("Perfil actualizado con éxito")
      setTimeout(() => {
        toggleOpenUpdate()
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      setMessage("Error al actualizar tu perfil")
    }
  }

  return (
    <div className={`containerUpdateProfile ${openUpdate ? "active" : ""}`}>
      <button className="edit-button" onClick={toggleOpenUpdate}>
        <TbUserEdit className="icon" />
        Editar Perfil
      </button>
      <div className="overlay" onClick={toggleOpenUpdate}></div>
      <div className="fromUpdate">
        <div className="form-header">
          <h2>Editar perfil</h2>
          <button className="close-button" onClick={toggleOpenUpdate}>
            <IoClose />
          </button>
        </div>
        {message && <p className={`message ${message.includes("éxito") ? "success" : "error"}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre: </label>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo: </label>
            <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required />
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


import { useState, useEffect, useRef } from "react"
import { getProfiles, updateProfile } from "../../services/users"
import { availableInterests } from "../../data/interests"
import "../../assets/css/profile/updateProfile.css"
import { TbUserEdit } from "react-icons/tb"
import { IoClose } from "react-icons/io5"
import { FaCamera } from "react-icons/fa"
import axios from 'axios'

const UpdateProfile = () => {
  // Add new state for preview
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar: "",
    newPassword: "",
    confirmPassword: "",
    descripcion_usuario: "",
  })
  const [message, setMessage] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profile.intereses) {
      setSelectedInterests(profile.intereses);
    }
  }, [profile.intereses]);
  
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
      // Reset interests to profile's current interests when closing
      if (profile.intereses) {
        setSelectedInterests(profile.intereses);
      }
    }
  }

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      if (prev.length >= 5) {
        setMessage("Máximo 5 intereses permitidos");
        return prev;
      }
      return [...prev, interest];
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }))
      // Limpiar el mensaje cuando el usuario empieza a escribir
    if (message) {
      setMessage("");
    }
  }
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
  
      const formData = new FormData();
      formData.append('imagen', file);
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          'http://localhost:3009/users/actualizar-foto-perfil', 
          formData, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
  
        if (response.data.avatarUrl) {
          setProfile(prev => ({
            ...prev,
            avatar: `http://localhost:3009${response.data.avatarUrl}`
          }));
          // Delay clearing the preview until the new image is loaded
          setTimeout(() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewImage(null);
          }, 1000);
        }
      } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        // Keep the preview on error so user can see what they selected
        setPreviewImage(previewUrl);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
     // Validación de la descripción antes de enviar el formulario
    if (profile.descripcion_usuario.length < 10) {
      setMessage("La descripción debe tener al menos 10 caracteres.");
      return; // Detiene la ejecución de la función y no envía el formulario
    }
    
    try {
      const updateData = {
        nombre: profile.nombre,
        username: profile.username,
        email: profile.email,
        descripcion_usuario: profile.descripcion_usuario,
        estado: profile.estado,
        intereses: selectedInterests,
      };

      console.log('Datos a actualizar:', updateData); // Debug log
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No se encontró el ID del usuario');
      }

      await updateProfile(updateData);
      
      // Refresh profile data after update
      const userData = await getProfiles();
      setProfile(prev => ({
        ...prev,
        ...userData,
        newPassword: "",
        confirmPassword: "",
      }));

      setMessage("Perfil actualizado con éxito");
      setTimeout(() => {
        setMessage("");
        toggleModal();
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setMessage("Error al actualizar tu perfil");
    }
  };
  return (
    <div className={`containerUpdateProfile ${isOpen ? "active" : ""}`}>
      <button className="w-full md:w-auto px-5 py-1 bg-[#bda7f1] text-white rounded-3xl hover:bg-[#866bb8] transition-colors flex items-center justify-center gap-2 text-lg font-medium buttin" onClick={toggleModal}>
        <TbUserEdit className="icon" />
        Actualizar
      </button>
      {isOpen && <div className="modal-overlay" onClick={toggleModal}></div>}
      {isOpen && (
      <div className="fromUpdate">
        <div className="form-header">
          <h2>Actualiza Tu perfil</h2>
          <button className="close-buttonPerfil" onClick={toggleModal}>
            <IoClose />
          </button>
        </div>
        {message && <p className={`message ${message.includes("éxito") ? "success" : "error"}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="imgProfileAp">
            <div className="avatar-container">
            <img 
              src={previewImage || (profile.avatar && profile.avatar.trim() !== "" ? 
                (profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:3009${profile.avatar}`)
                : "/placeholder.svg")} 
              alt="Profile" 
              className="avatar"
              onError={(e) => { e.target.src = "/placeholder.svg"; }}
            />
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
              id="nombre"
              name="nombre"
              value={profile.nombre || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
            />
          </div>
          <div className="form-group">
            <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <textarea
              id="descripcion_usuario"
              name="descripcion_usuario"
              rows={3}
              className="texttarea w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={profile.descripcion_usuario || ''}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              maxLength={153}
            />
          </div>
          <div className="form-group">
            <button 
              type="button" 
              className="interests-button"
              onClick={() => setShowInterestsModal(true)}
            >
              Seleccionar intereses ({selectedInterests.length}/5)
            </button>
          </div>
          {/* Interests Modal */}
          {showInterestsModal && (
            <div className="interests-modal">
              <div className="interests-modal-content">
                <h3>Selecciona tus intereses (máximo 5)</h3>
                <div className="interests-grid">
                  {availableInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                      disabled={selectedInterests.length >= 5 && !selectedInterests.includes(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="close-interests"
                  onClick={() => {
                    setShowInterestsModal(false);
                    // Update profile with selected interests
                    setProfile(prev => ({
                      ...prev,
                      intereses: selectedInterests
                    }));
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
          <button type="submit" className="submit-button">
            Guardar Cambios
          </button>
        </form>
      </div>
    )}
    </div>
  )
}

export default UpdateProfile


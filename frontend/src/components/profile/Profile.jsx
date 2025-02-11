import { useState } from "react";
import "../../assets/css/profile/profile.css";
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import UpdateProfile from "./UpdateProfile";

function Profile({ profile }) {
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s"
  const [isEditing, setIsEditing] = useState(false)

  const getAvatarSrc = () => {
    if (profile.avatar) {
      return `http://localhost:3009${profile.avatar}`
    }
    return avatarPorDefecto
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
  }

  return (
    <div className="profile">
      <div className="infoProfile">
        <div className="imgU">
          <img src={getAvatarSrc() || "/placeholder.svg"} alt={profile.nombre} />
          <p className="username">
            {profile.username}
          </p>
        </div>
        <div className="container-us">
          <h1 className="profile-name">
            <CiUser className="icon" />
            {profile.nombre}
          </h1>
          <div className="contentDen">
            <h3>Sobre mi</h3>
            <p>Soy una persona inteligente y me agrada mucho salir a caminar</p>
            <h4>Información General</h4>
            <p className="info-item">
              <BsEnvelope className="icon" /> {profile.email}
            </p>
            <p className="info-item">
              <BsGeoAlt className="icon" /> {profile.estado}
            </p>
          </div>
          <div>
            <UpdateProfile/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


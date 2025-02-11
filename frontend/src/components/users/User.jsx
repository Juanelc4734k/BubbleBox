import React from 'react'
import '../../assets/css/user/user.css';
import { CiStar, CiUser  } from "react-icons/ci";
import { GoHeart } from "react-icons/go";

function User({ user }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (user.avatar) {
            return `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };

    return (
      <div className="user-card">
        <div className="user-avatar-wrapper">
          <img className="user-avatar" src={getAvatarSrc() || "/placeholder.svg"} alt={user.username} />
          <span className={`status-indicator ${user.estado === "conectado" ? "online" : "offline"}`}></span>
        </div>
        <div className="user-info">
          <div className="user-header">
            <h2 className="user-name"> <CiUser className="user-icon" />{user.username}</h2>
          </div>
        </div>
        <button className="request-button">
          <GoHeart className="heart-icon" />
          Agregar
        </button>
      </div>
    )
}

export default User;
import React, {useState} from 'react';
import '../../assets/css/profile/profile.css';
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt, BsPencilSquare } from 'react-icons/bs';
import { CiUser  } from "react-icons/ci";
import { TbUserEdit } from "react-icons/tb";
function Profile({ profile }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const [isEditing, setIsEditing] = useState(false);

    const getAvatarSrc = () => {
        if (profile.avatar) {
            return `http://localhost:3009${profile.avatar}`;
        }
        return avatarPorDefecto;
    };

    const handleToggleEdit = () => {
      setIsEditing(!isEditing);
  };
  
  return (
    <div className='profile'>
      <div className="infoProfile">
        <div className="imgU">
          <img src={getAvatarSrc()} alt={profile.nombre} width="100"/>
          <p className="flex ml-28 mt-5 text-[3vh] text-white">
            <BsFillBalloonHeartFill className="mr-1 mt-1 text-purple-950"/>
            {profile.username}
          </p>
        </div>
        <div className="container-us ml-5 mt-4  rounded-xl">
        <h1 className="text-2xl font-bold flex justify-center items-center w-full text-center text-white bg-purple-400 rounded-tl-xl rounded-tr-xl h-12">
            <CiUser className="mr-1"/>
            {profile.nombre}
          </h1>
          <div className="contentDen">
            <h3 className="text-purple-600">
              Sobre mi
            </h3>
            <p className="text-[2.2vh] text-gray-600 pb-4">Soy una persona inteligente y me agrada mucho salir a caminar</p>
            <h4 className="text-purple-600">Información General</h4>
            <p className="flex items-center text-gray-600 mt-2">
              <BsEnvelope className="mr-2 text-purple-500" /> {profile.email}
            </p>
            <p className="flex items-center text-gray-600 mt-2">
              <BsGeoAlt className="mr-2 text-purple-500" /> {profile.estado}
            </p>
          </div>
          <button className="mt-3 ml-[27vh] text-white flex  bg-purple-500 pl-3 pr-3 rounded-xl ">
            <TbUserEdit className="mt-1 mr-1"/>
            Editar Perfil
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
import React from 'react'
import '../../assets/css/user/user.css';
import { CiStar } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { GoHeart } from "react-icons/go";

function User({ user }) {
    const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

    const getAvatarSrc = () => {
        if (user.avatar) {
            return `http://localhost:3009${user.avatar}`;
        }
        return avatarPorDefecto;
    };

    const getStatusColor = (status) => {
        return status === 'activo' ? 'green' : 'red'; // Puedes ajustar los valores de color
    };

    return (
        <div className='Users'>
            <div className='user pb-1'>
                <div className='imgUser w-full p-2 '>
                    <img className="img ml-5" src={getAvatarSrc()} alt={user.username} width="100"/>
                    <h2 className="text-white text-[3vh] pt-9 flex">
                        <CiUser className="mr-1 mt-1"/>
                        {user.username}
                    </h2> 
                </div>
                <div className='contenido ml-5 mt-2 mb-2'>
                    <p className="flex">
                        <CiStar className="mr-1 mt-1 text-purple-700"/>
                        {user.nombre}
                    </p>
                    <p>
                        {user.estado} 
                        {/*<span 
                            className="status-dot" 
                            style={{ backgroundColor: getStatusColor(user.estado) }} 
                        />*/}
                    </p>
                </div>
                <button className="button ml-16 rounded-xl flex text-[2.2vh] p-1 mb-3 bg-purple-400 pl-4 pr-4 text-white shadow-xl">
                    <GoHeart className="mr-1 mt-1"/>
                    Enviar solicitud
                </button>
            </div> 
        </div>
    )
}

export default User;
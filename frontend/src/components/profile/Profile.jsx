import { useState } from "react";
import { BsFillBalloonHeartFill, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { TbUserEdit } from "react-icons/tb";
import UpdateProfile from "./UpdateProfile";

function Profile({ profile, isOwnProfile }) {  // Add isOwnProfile prop
  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";
  const defaultDescription = "¡Hola! Soy nuevo en BubbleBox y estoy emocionado por conectar con nuevos amigos.";

  const getAvatarSrc = () => {
    if (profile.avatar) {
      return `http://localhost:3009${profile.avatar}`;
    }
    return avatarPorDefecto;
  };
  console.log(profile);

  return (
    <div className="min-h-screen pt-10  lg:pt-32 lg:-ml-72 px-4 bg-gradient-to-b profile">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Avatar and Username */}
          <div className="md:w-1/3 bg-[#bda7f1] p-5 lg:pt-24 flex flex-col items-center">
            <div className="relative">
              <img
                src={getAvatarSrc()}
                alt={profile.nombre}
                className="w-20 h-20 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {profile.username}
            </h2>
          </div>

          {/* Right side - Profile Information */}
          <div className="md:w-2/3 p-6 lg:p-9">
            <div className="flex items-center gap-3 mb-5">
              <CiUser className="text-purple-500" size={24} />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                {profile.nombre}
              </h1>
            </div>

            {/* About Me Section */}
            <div className="mb-5">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-1">
                Sobre mi
              </h3>
              <p className="text-gray-600 text-sm lg:text-lg ">
                {profile.descripcion_usuario || defaultDescription}
              </p>
            </div>

            {/* General Information */}
            <div>
              <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">
                Información General
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <BsEnvelope size={20} className="text-purple-500" />
                  <span className="text-sm lg:text-lg  ">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <BsGeoAlt size={20} className="text-purple-500" />
                  <span className="text-sm lg:text-lg ">{profile.estado}</span>
                </div>
              </div>
            </div>

            {/* Update Profile Section */}
            <div className="mt-3 pt-6 border-t border-gray-200">
              {isOwnProfile && <UpdateProfile />} {/* Only show if it's the user's own profile */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
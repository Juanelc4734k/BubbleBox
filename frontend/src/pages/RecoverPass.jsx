import React from 'react'
import RecoverPass from '../components/auth/RecoverPass'
import { Link } from 'react-router-dom';
import { TiArrowLeftThick } from "react-icons/ti";

function RecoverPassPage() {
  return (
    <div className="flex items-center justify-center shadow rounded-xl h-full">
      <div className="bg-white p-5 w-[80%] lg:w-[50%]  pb-10 rounded-lg  shadow-2xl">
        <Link to={"/login"}> <TiArrowLeftThick className='rounded-full size-6 shadow-2xl text-purple-950 hover:bg-purple-200 transition-all'/> </Link><h1 className="text-xl font-bold text-center mb-4 text-purple-700">Recuperar Contraseña</h1>
        <RecoverPass />
      </div>
    </div>
  )
}

export default RecoverPassPage;
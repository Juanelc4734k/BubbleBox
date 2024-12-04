import React from 'react'
import RecoverPass from '../components/auth/RecoverPass'

function RecoverPassPage() {
  return (
    <div className="flex items-center justify-center shadow rounded-xl h-[93vh] ">
      <div className="bg-white p-5 w-[50%] pb-10 rounded-lg  shadow-2xl">
        <h1 className="text-xl font-bold text-center mb-4 text-purple-700">Recuperar Contraseña</h1>
        <RecoverPass />
      </div>
    </div>
  )
}

export default RecoverPassPage;
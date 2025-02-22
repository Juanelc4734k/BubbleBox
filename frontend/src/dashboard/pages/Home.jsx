import React, { useState, useEffect } from 'react'
import { getUserById } from '../services/admin'

const Home = () => {
    const [nombreAdministrador, setNombreAdministrador] = useState('')

    useEffect(() => {
        const id = localStorage.getItem('userId')
        getUserById(id).then((data) => {
            setNombreAdministrador(data.nombre)
        })
    }, [])

  return (
    <>
        <div className='home-container'>
            <Navbar />
            <Sidebar />
            <div className="buscador">
                <input type="text" placeholder="Buscar" />
                <button>Buscar</button>
            </div>
            <div className="bienvenida">
                <h1>Bienvenido</h1>
                <p>{nombreAdministrador}</p>
            </div>
            <div className="numeroVisitas">
                <p>Numero de visitas</p>
            </div>
        </div>
    </>
  )
}

export default Home


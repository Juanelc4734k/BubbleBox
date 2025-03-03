import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllReels } from '../services/reels'
import Reel from '../components/reels/Reel'
import '../assets/css/layout/reels.css'

const Reels = () => {
  const [reels, setReels] = useState([])
  const [error, setError] = useState(null)
  const parrafoComm = "Reels recientes"
  const [mostrarT, setMostrarT] = useState(true)
  const [noVer, setNoVer] = useState(false)
  const [textoM, setTextoM] = useState("")
  const [activeTab, setActiveTab] = useState('all') // New state for active tab
  const userId = parseInt(localStorage.getItem('userId')) // Add userId

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const fetchedReels = await getAllReels()
        setReels(fetchedReels)
      } catch (error) {
        console.error('Error al obtener los reels:', error)
        setError('Ocurrió un error al cargar los reels. Por favor, intenta de nuevo más tarde.')
      }
    }

    fetchReels()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarT(false)
      setTimeout(() => setNoVer(true), 1500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let i = 0
    const escribir = setInterval(() => {
      if (i < parrafoComm.length) {
        setTextoM((prev) => (prev !== undefined ? prev + (parrafoComm[i] || '') : parrafoComm[i]))
        i++
      } else {
        clearInterval(escribir)
      }
    }, 100)
    
    return () => clearInterval(escribir)
  }, [])

  // Filter reels based on active tab
  const filteredReels = activeTab === 'my' 
    ? reels.filter(reel => reel.usuario_id === userId)
    : reels;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="home-container"
    >
      {error ? (
        <p>{error}</p>
      ) : (
        <div className='divpostss'>
          <div className="textOcul">
            {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
          </div>

          {/* Tab Navigation */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Todos los Reels
              </button>
              <button 
                className={`tab ${activeTab === 'my' ? 'active' : ''}`}
                onClick={() => setActiveTab('my')}
              >
                Mis Reels
              </button>
            </div>
          </div>

          <div className="reels-container">
            {filteredReels.length > 0 ? (
              filteredReels.map(reel => (
                <Reel key={reel.id} reel={reel} isMyReelsTab={activeTab === 'my'} />
              ))
            ) : (
              <div className="no-reels">
                {activeTab === 'my' 
                  ? 'No has creado ningún reel todavía.' 
                  : 'No hay reels disponibles.'}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Reels
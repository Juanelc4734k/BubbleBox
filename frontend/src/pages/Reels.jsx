import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllReels } from '../services/reels'
import Reel from '../components/reels/Reel'
import '../assets/css/layout/reels.css'

const Reels = ({ openCommentsSidebar }) => {
  const [reels, setReels] = useState([])
  const [error, setError] = useState(null)
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

  // Filter reels based on active tab
  const filteredReels = activeTab === 'my' 
    ? reels.filter(reel => reel.usuario_id === userId)
    : reels;

  return (
    // contenedor principal
    <div className="reels-Container">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="reelss"
    >
      {error ? (
        <p>{error}</p>
      ) : (
        // contenedor 
        <div className='Conten-Reels1'>
          {/* Tab Navigation */}
          <div className="tabs-Reels">
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


          <div className="Conten-Reels2">
            
            {filteredReels.length > 0 ? (
              filteredReels.map(reel => (
                <Reel 
                  key={reel.id} 
                  reel={reel} 
                  isMyReelsTab={activeTab === 'my'} 
                  openCommentsSidebar={openCommentsSidebar} 
                />
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
    </div>
  )
}

export default Reels
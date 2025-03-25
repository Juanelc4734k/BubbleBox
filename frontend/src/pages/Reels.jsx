import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllReels } from '../services/reels'
import Reel from '../components/reels/Reel'
import '../assets/css/layout/reels.css'
import { IoVideocamOutline } from "react-icons/io5";
import Modal from '../components/reels/createReels';


const Reels = ({ openCommentsSidebar }) => {
  const [reels, setReels] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // New state for active tab
  const userId = parseInt(localStorage.getItem('userId')) // Add userId
  const [modalOpen, setModalOpen] = useState(false);

  
  const avatarPorDefecto = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';

  const getAvatarSrc = () => {
      if (reels.avatar) {
          return reels.avatar.startsWith('http')
              ? reels.avatar
              : `http://localhost:3009${reels.avatar}`;
      }
      return avatarPorDefecto;
  };


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

            <div className="tabs-reel">




              <button className='tab-reel-1' onClick={() => setModalOpen(true)}>+</button>
              <button 
                className={`tab-reel-1 ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Todos
              </button>
              <button 
                className={`tab-reel-1 ${activeTab === 'my' ? 'active' : ''}`}
                onClick={() => setActiveTab('my')}
              >
                Mis reels
              </button>
              <button className='tab-reel-1' >Guardados</button>
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

    <div className='modal-create-reels'>
               
    <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)} className='modal-reels'>
      <div className="header-modal-reels">
      <h2>Sube un nuevo video</h2>
      <h4>X</h4>
      {/* iconSalir */}
      </div>
    <div className="info-user-reels">
    <img src={getAvatarSrc()} alt={`Avatar de ${reels.username || 'Usuario desconocido'}`} />
    <p>{reels.username || 'Usuario desconocido'}</p>
    </div>
    <textarea name="" id="" placeholder='Descripción del video...'></textarea>
    <div className='conten-video'>
    <IoVideocamOutline />
    <button> <i className="fa-solid fa-arrow-up-from-bracket"></i>Subir Video</button>
    </div>
    <button className='publicar-reels'> 
    <i className="fa-regular fa-paper-plane"></i>
      Publicar </button>
    </Modal>
    </div>
          
    </div>
  )
}

export default Reels
import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../services/posts';
import { getStoriesFriends } from '../services/stories';
import Post from '../components/posts/Post';
import '../assets/css/pages/home.css';
import Storie from '../components/stories/Storie';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // New state for active tab
  
  const parrafoComm = "Publicaciones recientes";
  const [mostrarT, setMostrarT] = useState(true);
  const [noVer, setNoVer] = useState(false);
  const [textoM, setTextoM] = useState("");
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        const sortedPosts = fetchedPosts.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        setError('Ocurrió un error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.');
      }
    };

    const fetchStories = async () => {
      try {
        const response = await getStoriesFriends(userId);
        const fetchedStories = response.data || [];
        const sortedStories = fetchedStories.sort((a, b) => 
          new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        setStories(sortedStories);
      } catch (error) {
        console.error('Error al obtener las historias:', error);
        setError('Ocurrió un error al cargar las historias. Por favor, intenta de nuevo más tarde.');
      }
    }

    fetchStories();
    fetchPosts();
  }, [userId]);

  useEffect(() => {
        const timer = setTimeout(() => {
            setMostrarT(false);
            setTimeout(() => setNoVer(true), 1500);
        }, 3000);
        return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let i = 0;
    const escribir = setInterval(() => {
      if (i <= parrafoComm.length) {
        setTextoM(parrafoComm.substring(0, i));
        i++;
      } else {
        clearInterval(escribir);
      }
    }, 100);
    
    return () => clearInterval(escribir);
  }, []);

  // Filter posts based on active tab
  const filteredPosts = activeTab === 'my' 
    ? posts.filter(post => post.id_usuario === parseInt(userId))
    : posts;

  return (
    <>
      <div className="stories">
        {stories.map(story => (
          <Storie key={story.id} story={story} />
        ))}
      </div>

      <div className="home-container">
            <div className="textOcul">
              {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
            </div>
        {/* Tab Navigation - Now inside home-container */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Publicaciones
            </button>
            <button 
              className={`tab ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
            >
              Mis Publicaciones
            </button>
          </div>
        </div>
        
        {error ? (
          <p>{error}</p>
        ) : (
          <div className='divpostss'>
            
            <div className="postss">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    isMyPostsTab={activeTab === 'my'} 
                  />
                ))
              ) : (
                <div className="no-posts">
                  {activeTab === 'my' 
                    ? 'No has creado ninguna publicación todavía.' 
                    : 'No hay publicaciones disponibles.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
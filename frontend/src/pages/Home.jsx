import React, { useState, useEffect, useRef } from 'react';
import { getAllPosts } from '../services/posts';
import { getStoriesFriends, getStoriesByUser } from '../services/stories';
import Post from '../components/posts/Post';
import '../assets/css/pages/home.css';
import Storie from '../components/stories/Storie';
import { useParams, useLocation } from 'react-router-dom';

const Home = ({ openCommentsSidebar }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // New state for active tab
  const [currentStoryGroupIndex, setCurrentStoryGroupIndex] = useState(0);

  const userId = localStorage.getItem('userId');

  const { id: targetPostId } = useParams();
  const location = useLocation();
  const postRefs = useRef({});


  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        const filteredPosts = fetchedPosts.filter(post => !post.id_comunidad);
        const sortedPosts = filteredPosts.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        setError('Ocurrió un error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.');
      }
    };


    const fetchStories = async () => {
      try {
        // Obtener historias de amigos
        const response = await getStoriesFriends(userId);
        const friendStories = response.data || [];
        
        // Obtener historias del usuario actual
        const myStoriesResponse = await getStoriesByUser(userId);
        const myStories = myStoriesResponse.data || [];
        
        // Combinar ambas listas
        const allStories = [...myStories, ...friendStories];
        
        // Eliminar duplicados (si hay alguno)
        const uniqueStories = allStories.filter((story, index, self) =>
          index === self.findIndex((s) => s.id === story.id)
        );
        
        // Agrupar historias por usuario
        const storiesByUser = uniqueStories.reduce((acc, story) => {
          if (!acc[story.usuario_id]) {
            acc[story.usuario_id] = [];
          }
          acc[story.usuario_id].push(story);
          return acc;
        }, {});
        
        // Convertir el objeto agrupado en un array
        let groupedStories = Object.values(storiesByUser);
        
        // Ordenar los grupos: primero el del usuario actual, luego por fecha de la historia más reciente
        groupedStories.sort((a, b) => {
          // Si a es del usuario actual, a va primero
          if (a[0].usuario_id === parseInt(userId) && b[0].usuario_id !== parseInt(userId)) {
            return -1;
          }
          // Si b es del usuario actual, b va primero
          if (b[0].usuario_id === parseInt(userId) && a[0].usuario_id !== parseInt(userId)) {
            return 1;
          }
          // Si ninguno es del usuario actual, ordenar por fecha de la historia más reciente
          const latestA = a.reduce((latest, story) => 
            new Date(story.fecha_creacion) > new Date(latest.fecha_creacion) ? story : latest, a[0]);
          const latestB = b.reduce((latest, story) => 
            new Date(story.fecha_creacion) > new Date(latest.fecha_creacion) ? story : latest, b[0]);
          
          return new Date(latestB.fecha_creacion) - new Date(latestA.fecha_creacion);
        });
        
        // Aplanar el array para tener todas las historias
        const sortedStories = groupedStories.flat();
        
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
    if (targetPostId && postRefs.current[targetPostId]) {
      setTimeout(() => {
        postRefs.current[targetPostId].scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        // Add highlight effect
        postRefs.current[targetPostId].classList.add('highlight-post');
        setTimeout(() => {
          postRefs.current[targetPostId].classList.remove('highlight-post');
        }, 3000);
      }, 500);
    }
  }, [targetPostId, posts]);

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
  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.usuario_id]) {
      acc[story.usuario_id] = [];
    }
    acc[story.usuario_id].push(story);
    return acc;
  }, {});

  const sortedUserGroups = Object.entries(storiesByUser).sort(([userIdA], [userIdB]) => {
    if (parseInt(userIdA) === parseInt(userId)) return -1;
    if (parseInt(userIdB) === parseInt(userId)) return 1;
    return 0;
  });
  
  return (
    <>
      <div className="stories-container">
        <div className="stories">
        {sortedUserGroups.map(([userIdKey, userStories], index) => (
            <Storie 
              key={`story-group-${userIdKey}`} 
              stories={userStories}
              onPrevUser={() => setCurrentStoryGroupIndex(index > 0 ? index - 1 : sortedUserGroups.length - 1)}
              onNextUser={() => setCurrentStoryGroupIndex(index < sortedUserGroups.length - 1 ? index + 1 : 0)}
              isFirst={index === 0}
              isLast={index === sortedUserGroups.length - 1}
            />
          ))}
        </div>
      </div>
      <div className="home-container">
        <div className="conten-home-header">
          <div className="tittle-conten-header-home">
            <p>Publicaciones recientes</p>
          </div>
            <div className="tabs-container">
                <button 
                  className={`tab-1 ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Publicaciones
                </button>

                <button 
                  className={`tab-2 ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  Mis Publicaciones
                </button>
            </div>
        </div>
            {/* <div className="textOcul">
              {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
            </div> */}
        {/* Tab Navigation - Now inside home-container */}
       
        
        {error ? (
          <p>{error}</p>
        ) : (
          <div className='divpostss'>
            
            <div className="postss">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post.id}
                    ref={el => postRefs.current[post.id] = el}
                    post={post} 
                    isMyPostsTab={activeTab === 'my'} 
                    openCommentsSidebar={openCommentsSidebar}
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
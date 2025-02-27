import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../services/posts';
import Post from '../components/posts/Post';
import '../assets/css/pages/home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const parrafoComm = "Publicaciones recientes";
  const [mostrarT, setMostrarT] = useState(true);
  const [noVer, setNoVer] = useState(false);
  const [textoM, setTextoM] = useState("");
  
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

    fetchPosts();
  }, []);

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

  return (
    <>
    <div className="home-container">
      {error ? (
        <p>{error}</p>
      ) : (
        <div className='divpostss'>
          <div className="textOcul">
            {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
          </div>
            <div className="postss">
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
          </div>
        </div>
      )}
    </div>
    <div>
    </div>
      
    </>
  );
};

export default Home;
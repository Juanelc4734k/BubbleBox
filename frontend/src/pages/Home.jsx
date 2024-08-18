import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../services/posts';
import Post from '../components/posts/Post';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        setError('Ocurrió un error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.');
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Bienvenido a la página de inicio</h1>
      <p>Esta es la página principal de nuestra aplicación.</p>
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          <h2>Publicaciones recientes</h2>
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
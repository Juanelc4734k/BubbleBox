import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../services/posts';
import Post from '../components/posts/Post';
import '../assets/css/pages/home.css';
import Chats from '../components/chats/Chats';

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
    <>
    <div className="home-container">
      {error ? (
        <p>{error}</p>
      ) : (
        <div className='divpostss'>
          <h2>Publicaciones recientes</h2>
          <div className="postss">
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
          </div>
        </div>
      )}
    </div>
    <div>
      <Chats />
    </div>
      
    </>
  );
};

export default Home;
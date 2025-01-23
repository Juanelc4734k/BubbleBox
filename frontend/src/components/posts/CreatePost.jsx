import React, { useEffect, useState } from 'react';
import { createPost } from '../../services/posts';
import { CiCirclePlus } from "react-icons/ci";
import "../../assets/css/posts/createPost.css";
import * as jwt_decode from "jwt-decode";

const CreatePost = () => {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [imagen, setImagen] = useState(null); // Para manejar archivos.
    const [mensaje, setMensaje] = useState("");
    const [openPost, setOpenPost] = useState(false);
    const [idUsuario, setIdUsuario] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const decoded = jwt_decode.jwtDecode(token);
              const loggedInUserId = decoded.userId; // Asegúrate que el campo en tu token sea 'userId'.
              setIdUsuario(loggedInUserId); // Guarda el id en el estado
            } else {
              console.log("No token found");
            }
          } catch (error) {
            console.error("Error al obtener el id del usuario:", error);
          }
        };
      
        fetchUserProfile();
      }, []);

    const togglePost = () => {
        setOpenPost(!openPost);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
    
        // Verificar si el contenido está vacío
        if (!titulo || !contenido) {
            setMensaje('Por favor, completa todos los campos');
            return;
        }
        console.log("Titulo antes de enviar:", titulo); 
        // Prepara los datos en FormData para incluir archivos.
        const postData = new FormData();
        postData.append("titulo", titulo.trim()); // Asegúrate de que no sea vacío ni tenga espacios en blanco.
        postData.append("contenido", contenido);
        if (imagen) {
            postData.append("imagen", imagen); // Solo añade la imagen si fue seleccionada.
        }
        if (idUsuario) {
            postData.append("idUsuario", idUsuario); // Incluye el ID del usuario en los datos.
        }
    
        // Mostrar en consola los datos del FormData (opcional para depurar)
        for (let pair of postData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
    
        try {
            const response = await createPost(postData);
            console.log(response);
            setMensaje('Publicación creada exitosamente');
            setTitulo("");
            setContenido("");
            setImagen(null);
        } catch (error) {
            setMensaje('Error al crear la publicación. Por favor, intenta de nuevo.');
            // Aquí es donde ponemos el bloque try...catch para manejar errores
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            } else {
                console.error("Error desconocido:", error.message);
            }
        }
    };
    

    const handleFileChange = (e) => {
        setImagen(e.target.files[0]);
    };

    return (
        <div className={`create-post ${openPost ? "active" : ""}`}>
            <button onClick={togglePost}>
                <CiCirclePlus className="icono0" />
            </button>
            <div className="formPost">
                {mensaje && <p className='mensaje'>{mensaje}</p>}
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div>
                        <label htmlFor="titulo">Título</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Título de la publicación"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="contenido">Contenido</label>
                        <textarea
                            id="contenido"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            placeholder="Contenido de la publicación"
                            rows={5}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="imagen">Imagen</label>
                        <input type="file" id="imagen" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <button type="submit">Publicar</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;

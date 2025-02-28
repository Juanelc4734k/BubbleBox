import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import * as jwt_decode from "jwt-decode";
import "../../assets/css/comunity/createComunity.css";
import { TbUsersPlus } from "react-icons/tb";
import { CiImageOn } from "react-icons/ci";
import { createCommunity } from "../../services/comunity";

const CreateComunity = () => {
    const [openComunity, setOpenComunity] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState(null);
    const [idCreador, setIdCreador] = useState("");
    const [imagenPreview, setImagenPreview] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [privacidad, setPrivacidad] = useState('publica'); // Add this new state
    const [showBubbles, setShowBubbles] = useState(false);
    const [animateMessage, setAnimateMessage] = useState(false);
    const [isCommunitySub, setIsCommunitySub] = useState(false);

    const scrollableRef = useRef(null);
    const modalRef = useRef(null);

    // Combinar ambas referencias en una sola función de ref
    const combinedRef = useCallback((node) => {
        if (node) {
            modalRef.current = node;
            scrollableRef.current = node;
        }
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const decoded = jwt_decode.jwtDecode(token);
                setIdCreador(decoded.userId);
            }
        } catch (error) {
            console.error("Error al obtener el id del usuario:", error);
        }
        };
        fetchUserProfile();
    }, [])

    useEffect(() =>{
        if(mensaje){
            setAnimateMessage(true)
            const timer = setTimeout(() => {
                setAnimateMessage(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensaje])

    useEffect(() => {
        if(mensaje) {
            setMensaje("");
        }
    }, [nombre, descripcion])

    const toggleComunity = () => {
        setOpenComunity(!openComunity);
        if(!openComunity){
            setNombre("");
            setDescripcion("");
            setImagen(null);
            setImagenPreview(null);
            setMensaje("");
        }
    };

    useEffect(() => {
        // Detectar clics fuera del modal
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpenComunity(false);
            }
        };
        if (openComunity) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openComunity]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(isCommunitySub) return; //Evita multiples clics
        setIsCommunitySub(true); //Desactiva el boton mientras se envia
        setMensaje("");

        if(!nombre || !descripcion){
            setMensaje("Error, Por favor completa todos los campos");
            if (scrollableRef.current) {
                scrollableRef.current.scrollTop = 0;
            }
            setTimeout(() => {
                setMensaje("");
            }, 3000);
            setIsCommunityub(false);
            return
        }

        const comunityData = new FormData();
        comunityData.append("nombre", nombre.trim());
        comunityData.append("descripcion", descripcion);
        comunityData.append("privacidad", privacidad); // Add this line
        if (idCreador) {
            comunityData.append("idCreador", idCreador);
        }
        if(imagen){
            comunityData.append("imagen", imagen);
        }

        try{
            const response = await createCommunity(comunityData);
            setMensaje("Comunidad creada exitosamente");
            if (scrollableRef.current) {
                scrollableRef.current.scrollTop = 0;
            }
            setShowBubbles(true);
            setTimeout(() => {
                setShowBubbles(false);
                toggleComunity();
            }, 3000);
        }catch(error){
            setMensaje("Error al crear la comunidad");
            if (scrollableRef.current) {
                scrollableRef.current.scrollTop = 0;
            }
            setTimeout(() => {
                toggleComunity();
            }, 2000);
            console.error("Error:", error);
        } finally {
            setIsCommunitySub(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
            setImagen(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const createBubbles = () => {
        return Array.from({ length: 10 }).map((_, index) => {
          const style = {
            left: `${Math.random() * 90 + 5}%`, // Evita valores extremos en los bordes
          "--tx": `${(Math.random() - 0.5) * 40}px`, // Movimiento horizontal más suave
          "--ty": `${-100 - Math.random() * 100}px`, // Asegura que suban más uniformemente
          animationDelay: `${Math.random() * 1}s`, // Aumenta la variación del delay
          }
          return <div key={index} className="bubble" style={style}></div>
        })
      }

      

    return(
        <div className={`create-comunity ${openComunity ? "active" : ""}`} >
            <button className="create-comunity-button" onClick={toggleComunity}>
                <TbUsersPlus className="icono0" />
                <span>Comunidad</span>
            </button>
            {openComunity && (
                <div className="modal-overlay">
                    <div ref={combinedRef}  className="formComunity">
                        <div className="form-header">
                            <h2><TbUsersPlus className="iconoComunity" /> Crear Comunidad</h2>
                            <button className="close-button" onClick={toggleComunity}>
                                <IoClose />
                            </button>
                        </div>
                        {mensaje && (
                            <div className={`mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>
                            {mensaje}
                            {showBubbles && createBubbles()}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    id="nombre" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    placeholder="Nombre de la comunidad" 
                                />
                            </div>
                            <div className="form-group">
                                <textarea  
                                    id="descripcion"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Descripción de la comunidad"
                                    rows={5}
                                />
                            </div>
                            <div className="form-group file-input">
                                <input type="file" id="imagen" accept="image/*" onChange={handleFileChange} className="hidden-input" />
                                <label htmlFor="imagen" className="file-label">
                                    <CiImageOn />
                                    <span>Agregar imagen</span>
                                </label>
                                {imagenPreview && (
                                    <div className="image-preview">
                                        <img src={imagenPreview || "/placeholder.svg"} alt="Preview" />
                                        <button 
                                            type="button" 
                                            className="remove-image" 
                                            onClick={() => {
                                                setImagen(null);
                                                setImagenPreview(null);
                                                const fileInput = document.getElementById("imagen");
                                                if(fileInput){
                                                    fileInput.value = "";
                                                }
                                            }}>
                                                <IoClose />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="submit-button" disabled={isCommunitySub}>
                                {isCommunitySub ? "Creando..." : "Crear Comunidad"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateComunity;

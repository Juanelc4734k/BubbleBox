import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import * as jwt_decode from "jwt-decode";
import "../../assets/css/comunity/createComunity.css";
import { TbUsersPlus } from "react-icons/tb";
import { CiImageOn } from "react-icons/ci";
import { createCommunity } from "../../services/comunity";
import { FaUsers, FaLock } from "react-icons/fa";
import DOMPurify from "dompurify";

const CreateComunity = () => {
    const [openComunity, setOpenComunity] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [rules, setRules] = useState(['']);
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

    const sanitizeInput = (input) => {
        return DOMPurify.sanitize(input);
      };

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
            }, 1000);
            setIsCommunitySub(false);
            return
        }

        const sanitizedNombre = sanitizeInput(nombre.trim());
        const sanitizedDescripcion = sanitizeInput(descripcion);

        const comunityData = new FormData();
        comunityData.append("nombre", sanitizedNombre);
        comunityData.append("descripcion", sanitizedDescripcion);
        comunityData.append("privacidad", privacidad);
        if (idCreador) {
            comunityData.append("idCreador", idCreador);
        }
        if(imagenAvatar){
            comunityData.append("avatar", imagenAvatar);
        }
        if(imagenBanner){
            comunityData.append("banner", imagenBanner);
        }
        const filteredRules = rules.filter(rule => rule.trim() !== '');
        comunityData.append("reglas", JSON.stringify(filteredRules.length > 0 ? filteredRules : []));

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
            }, 800);
        }catch(error){
            setMensaje("Error al crear la comunidad");
            if (scrollableRef.current) {
                scrollableRef.current.scrollTop = 0;
            }
            setTimeout(() => {
                toggleComunity();
            }, 1000);
            console.error("Error:", error);
        } finally {
            setIsCommunitySub(false);
        }
    };

    const [imagenAvatar, setImagenAvatar] = useState(null);
    const [imagenBanner, setImagenBanner] = useState(null);
    const [imagenAvatarPreview, setImagenAvatarPreview] = useState(null);
    const [imagenBannerPreview, setImagenBannerPreview] = useState(null);
    // Keep existing states except replace imagen/imagenPreview with above

    const handleFileChange = (type) => (e) => {
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onloadend = () => {
                if(type === 'avatar') {
                    setImagenAvatar(file);
                    setImagenAvatarPreview(reader.result);
                } else {
                    setImagenBanner(file);
                    setImagenBannerPreview(reader.result);
                }
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
                        <div className="form-headerCominuty">
                            <h2><TbUsersPlus className="iconoComunity" /> Crear Comunidad</h2>
                            <button className="close-buttonComi" onClick={toggleComunity}>
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
                            <div className="form-group file-input-Avatar">
                            <input 
                                type="file" 
                                id="imagenAvatar" 
                                accept="image/*" 
                                onChange={handleFileChange('avatar')} 
                                className="hidden-input" 
                            />
                            
                            <label htmlFor="imagenAvatar" className="file-label-Avatar">
                                {imagenAvatarPreview ? (
                                    <div className="image-preview-Avatar">
                                        <img src={imagenAvatarPreview} alt="Avatar Preview" />
                                        <button 
                                            type="button" 
                                            className="remove-image-Avatar"
                                            onClick={() => {
                                                setImagenAvatar(null);
                                                setImagenAvatarPreview(null);
                                                document.getElementById('imagenAvatar').value = '';
                                            }}
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <CiImageOn />
                                        <span>Avatar</span>
                                    </>
                                )}
                            </label>
                        </div>
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

                            {/* Add Rules Section */}
                            <div className="form-group rules-section">
                                <h3>Reglas de la comunidad</h3>
                                {rules.map((rule, index) => (
                                    <div key={index} className="rule-input-group">
                                        <span className="rule-number">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={rule}
                                            onChange={(e) => {
                                                const newRules = [...rules];
                                                newRules[index] = e.target.value;
                                                setRules(newRules);
                                            }}
                                            placeholder={`Regla ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className="remove-rule"
                                            onClick={() => {
                                                const newRules = rules.filter((_, i) => i !== index);
                                                setRules(newRules.length ? newRules : ['']);
                                            }}
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-rule-btn"
                                    onClick={() => setRules([...rules, ''])}
                                >
                                    + Añadir regla
                                </button>
                            </div>

                            {/* Moved privacy and images section here */}
                            <div className="form-group privacy-selector">
                                <div className="privacy-options">
                                    <button
                                        type="button"
                                        className={`privacy-option ${privacidad === 'publica' ? 'active' : ''}`}
                                        onClick={() => setPrivacidad('publica')}
                                    >
                                        <FaUsers className="privacy-icon" />
                                        <span>Pública</span>
                                        <small>Cualquiera puede unirse</small>
                                    </button>
                                    <button
                                        type="button"
                                        className={`privacy-option ${privacidad === 'privada' ? 'active' : ''}`}
                                        onClick={() => setPrivacidad('privada')}
                                    >
                                        <FaLock className="privacy-icon" />
                                        <span>Privada</span>
                                        <small>Solo por invitación</small>
                                    </button>
                                </div>
                            </div>

                            <div className="form-group file-input">
                                <input type="file" id="imagenBanner" accept="image/*" 
                                    onChange={handleFileChange('banner')} className="hidden-input" />
                                <label htmlFor="imagenBanner" className="file-label">
                                    <CiImageOn />
                                    <span>Banner de la comunidad</span>
                                </label>
                                {imagenBannerPreview && (
                                    <div className="image-preview">
                                        <img src={imagenBannerPreview} alt="Banner Preview" />
                                        <button type="button" className="remove-image" 
                                            onClick={() => {
                                                setImagenBanner(null);
                                                setImagenBannerPreview(null);
                                                document.getElementById('imagenBanner').value = '';
                                            }}>
                                            <IoClose />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Removed old image upload section */}

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

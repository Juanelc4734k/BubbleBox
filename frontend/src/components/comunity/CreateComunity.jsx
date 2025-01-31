import React, { useState, useEffect } from "react";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");

        if(!nombre || !descripcion){
            setMensaje("Por favor, completa todos los campos");
            return;
        }

        const comunityData = new FormData();
        comunityData.append("nombre", nombre.trim());
        comunityData.append("descripcion", descripcion);
        if (idCreador) {
            comunityData.append("idCreador", idCreador);
        }
        if(imagen){
            comunityData.append("imagen", imagen);
        }

        try{
            const response = await createCommunity(comunityData);
            setMensaje("Comunidad creada exitosamente");
            setTimeout(() => {
                toggleComunity();
            }, 2000);
        }catch(error){
            setMensaje("Error al crear la comunidad");
            console.error("Error:", error);
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

    return(
        <div className={`create-comunity ${openComunity ? "active" : ""}`} >
            <button className="create-comunity-button" onClick={toggleComunity}>
                <TbUsersPlus className="icono0" />
                <span>Nueva Comunidad</span>
            </button>
            {openComunity && (
                <div className="formComunity">
                    <div className="form-header">
                        <h2><TbUsersPlus className="iconoComunity" /> Crear Comunidad</h2>
                        <button className="close-button" onClick={toggleComunity}>
                            <IoClose />
                        </button>
                    </div>
                    {mensaje && (
                        <p className={`mensaje ${mensaje.includes("error") ? "error" : "success"}`}>{mensaje}</p>
                    )}
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="form-group">
                            <input 
                                type="text" 
                                id="nombre" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Nombre de la comunidad" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <textarea  
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción de la comunidad"
                                rows={5}
                                required
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
                        <button type="submit" className="submit-button">
                            Crear Comunidad
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateComunity;

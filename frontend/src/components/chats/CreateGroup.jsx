import React, { useEffect, useState, useRef, useCallback } from "react";
import { CiCirclePlus, CiImageOn } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import "../../assets/css/chats/createGroup.css";
import * as jwt_decode from "jwt-decode";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

const CreateGroup = ({ isCreateGroupOpen, setIsCreateGroupOpen }) => {
  console.log("isCreateGroupOpen:", isCreateGroupOpen);
  console.log("setIsCreateGroupOpen:", setIsCreateGroupOpen);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [openGroup, setOpenGroup] = useState(false);
  const [idUsuario, setIdUsuario] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [showBubbles, setShowBubbles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTooltip, setIsTooltip] = useState("");

  const scrollableRef = useRef(null);
  const modalRef = useRef(null);

  const combinedRef = useCallback((node) => {
    if (node) {
      modalRef.current = node;
      scrollableRef.current = node;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenGroup(false);
      }
    };
    if (openGroup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openGroup]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwt_decode.jwtDecode(token);
          setIdUsuario(decoded.userId);
        }
      } catch (error) {
        console.error("Error al obtener el id del usuario:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const toggleGroup = () => {
    setOpenGroup(!openGroup);
    setIsCreateGroupOpen(!openGroup);
    if (!openGroup) {
      setNombre("");
      setDescripcion("");
      setImagen(null);
      setImagenPreview(null);
      setMensaje("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMensaje("");

    if (!nombre || !descripcion) {
      setMensaje("Error, Por favor completa todos los campos");
      setIsSubmitting(false);
      return;
    }

    const groupData = new FormData();
    groupData.append("nombre", nombre.trim());
    groupData.append("descripcion", descripcion);
    if (imagen) {
      groupData.append("imagen", imagen);
    }
    if (idUsuario) {
      groupData.append("idUsuario", idUsuario);
    }

    try {
      await createGroup(groupData);
      setMensaje("Grupo creado exitosamente");
      setShowBubbles(true);
      setTimeout(() => {
        setShowBubbles(false);
        toggleGroup();
      }, 3000);
    } catch (error) {
      setMensaje("Error al crear el grupo");
      setTimeout(() => {
        toggleGroup();
      }, 2000);
      console.error("Error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`create-group ${openGroup ? "active" : ""}`}>
      <div className="tooltipGroupContainer">
          <button 
            className="create-group-button" 
            onClick={toggleGroup}
            onMouseEnter={() => setIsTooltip("CrearGrupo")}
            onMouseLeave={() => setIsTooltip("")}
          >
          <AiOutlineUsergroupAdd className="icono0" />
          {isTooltip === "CrearGrupo" && <span className="tooltipGroup">Crear Grupo</span>}
        </button>
      </div>
      {openGroup && (
        <div className="modal-overlay">
          <div ref={combinedRef} className="formGroup">
            <div className="form-header">
              <h2>
                <AiOutlineUsergroupAdd className="iconoGrupo" /> Crear Grupo
              </h2>
              <button className="close-buttonGro" onClick={toggleGroup}>
                <IoClose />
              </button>
            </div>
            {mensaje && (
              <div className={`mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>
                {mensaje}
              </div>
            )}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del grupo"
                />
              </div>
              <div className="form-group">
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del grupo"
                  rows={5}
                />
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Grupo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroup;

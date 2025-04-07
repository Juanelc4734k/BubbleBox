import { useState } from "react";
import '../../assets/css/auth/modalTerminos.css';
import { LuBook } from "react-icons/lu";
import { PiNoteBold } from "react-icons/pi";


export default function ModalConTabs({ onClose }) {
  const [tabActivo, setTabActivo] = useState("terminos");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 container-principal">
      <div className="bg-white p-6 rounded-xl w-11/12 md:w-1/2 relative shadow-lg container-modal">
        
        {/* Botón para cerrar */}
        <div className="closeModal">
          <div className="titulo">
          <i className="fa-regular fa-file"></i>
            Documentación
          </div>

        <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>


        {/* Tabs */}
        <div className=" conten-tabs-modal">
          <button
            onClick={() => setTabActivo("terminos")}
            className={`tabss ${
              tabActivo === "terminos" ? "active" : "text-gray-600"
            }`}
          >
            <PiNoteBold className="ico"/>

            Términos y Condiciones
          </button>
          <button
            onClick={() => setTabActivo("manual")}
            className={`tabss ${
              tabActivo === "manual" ? "active" : "text-gray-600"
            }`}
          >
            <LuBook className="ico"/>
            Manual de Usuario
          </button>
        </div>

        {/* Contenido según el tab */}
        {tabActivo === "terminos" && (
          <div className="conten-contenido">
            <p className="mb-2">Puedes ver los términos y condiciones aquí:</p>
            <a
              href="https://drive.google.com/file/d/1rf9gP5GKeMyPY7h6kgH-JElcogvH3OqG/view?usp=drive_link"
              target="_blank"
              className=""
            >
              Abrir PDF de Términos
            </a>
          </div>
        )}

        {tabActivo === "manual" && (
          <div className="conten-contenido">
            <p className="mb-2">Puedes ver el manual de usuario aquí:</p>
            <a
              href="https://drive.google.com/file/d/1kCfdTz13o8Su-v--LrHjAKcfJdb-M-iP/view?usp=drive_link"
              target="_blank"
              className="text-blue-500 underline"
            >
              Abrir PDF del Manual
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

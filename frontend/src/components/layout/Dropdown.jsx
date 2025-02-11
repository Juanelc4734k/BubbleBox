import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/layout/dropdown.css";
import bubbleSound from "../../assets/sounds/bubble-sound-43207.mp3";
import { TbSettings } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    
    const handleBubbleClick = (e) => {
        const bubble = e.target;
        bubble.classList.add("explode");
    
        // Reproducir sonido
        const audio = new Audio(bubbleSound);
        audio.currentTime = 0;
        audio.play();
    
        // Reiniciar la animación
        setTimeout(() => {
            bubble.classList.remove("explode");
        }, 500);
    };

    return (
        <div className={`dropdown ${isOpen ? "active" : ""}`}>
            <button className="dropdown-toggle" onClick={toggleMenu}>
                <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div className="dro">
                <Link className="dropdown-item bubblee" onClick={handleBubbleClick} to="/users">
                    <TbSettings />
                </Link>
                <Link className="dropdown-item bubblee" onClick={handleBubbleClick} to="/perfil">
                    <AiOutlineUser />
                </Link>
            </div>
        </div>
    );
};

export default Dropdown;

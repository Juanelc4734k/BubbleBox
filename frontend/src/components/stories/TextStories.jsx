import React, { useState } from "react";
import "../../assets/css/stories/textStories.css";

const TextStories = ({ text, setText, idUsuario }) => {
    const [isPurple, setIsPurple] = useState(true);
    const [isBlue, setIsBlue] = useState(false);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const toggleColor = () => {
        setIsPurple(!isPurple);
        setIsBlue(!isBlue);
    };

    return (
        <div className="textStoriesContainer">
            <button 
                type="button"
                onClick={toggleColor}
                className={`colorToggle ${isPurple ? 'purple' : 'blue'}`}
            >
                Cambiar Color
            </button>
            <textarea
                className={`textStoriesInput ${isPurple ? 'purpleTheme' : 'blueTheme'}`}
                placeholder="Escribe tu historia..."
                value={text}
                onChange={handleTextChange}
            />
        </div>
    );
};

export default TextStories;
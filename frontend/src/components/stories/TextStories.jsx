import React, { useState } from "react";
import "../../assets/css/stories/textStories.css";

const TextStories = ({ text, setText, idUsuario }) => {

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div className="textStoriesContainer">
            <textarea
                className="textStoriesInput"
                placeholder="Escribe tu historia..."
                value={text}
                onChange={handleTextChange}
            />
        </div>
    );
};

export default TextStories;
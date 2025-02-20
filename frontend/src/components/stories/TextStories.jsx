import React, { useEffect, useState } from "react";
import "../../assets/css/stories/textStories.css";

const TextStories = () => {

    const [isPurple, setIsPurple] = useState(true);
    const [isBlue, setIsBlue] = useState(false);
    return (
        <div className="textStoriesContainer">
            <button>
                
            </button>
          <textarea
            className="textStoriesInput"
            placeholder="Escribe tu historia..."
          />
        </div>
      )

}

export default TextStories


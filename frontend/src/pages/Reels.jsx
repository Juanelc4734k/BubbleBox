import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getAllReels, createReel } from "../services/reels";
import Reel from "../components/reels/Reel";
import "../assets/css/layout/reels.css";
import { IoVideocamOutline } from "react-icons/io5";
import Modal from "../components/reels/createReels";
import { FaUpload } from "react-icons/fa";

const Reels = ({ openCommentsSidebar }) => {
  const [reels, setReels] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // New state for active tab
  const userId = parseInt(localStorage.getItem("userId")); // Add userId
  const [modalOpen, setModalOpen] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [descripcion, setDescripcion] = useState("");



  const avatarPorDefecto =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s";

  const getAvatarSrc = () => {
    if (reels.avatar) {
      return reels.avatar.startsWith("http")
        ? reels.avatar
        : `http://localhost:3009${reels.avatar}`;
    }
    return avatarPorDefecto;
  };

  
  useEffect(() => {
    document.body.classList.add("reels-page");

    return () =>{
      document.body.classList.remove("reels-page");
    }
  },[]);
  
  const handleDeleteVideo = () => {
    setVideoFile(null); // 📌 Quitar el video
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const fetchedReels = await getAllReels();
        setReels(fetchedReels);
      } catch (error) {
        console.error("Error al obtener los reels:", error);
        setError(
          "Ocurrió un error al cargar los reels. Por favor, intenta de nuevo más tarde."
        );
      }
    };

    fetchReels();
  }, []);

  // Filter reels based on active tab
  const filteredReels =
    activeTab === "my"
      ? reels.filter((reel) => reel.usuario_id === userId)
      : reels;

  return (
    // contenedor principal
    <div className="reels-Container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="reelss"
      >
        {error ? (
          <p>{error}</p>
        ) : (
          // contenedor
          <div className="Conten-Reels1">
            {/* Tab Navigation */}
            <div className="tabs-Reels">
              <div className="tabs-reel">
                <button
                  className="tab-reel-1"
                  onClick={() => setModalOpen(true)}
                >
                  +
                </button>
                <button
                  className={`tab-reel-1 ${
                    activeTab === "all" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  Todos
                </button>
                <button
                  className={`tab-reel-1 ${activeTab === "my" ? "active" : ""}`}
                  onClick={() => setActiveTab("my")}
                >
                  Mis reels
                </button>
              </div>
            </div>

            <div className="Conten-Reels2">
              {filteredReels.length > 0 ? (
                filteredReels.map((reel) => (
                  <Reel
                    key={reel.id}
                    reel={reel}
                    isMyReelsTab={activeTab === "my"}
                    openCommentsSidebar={openCommentsSidebar}
                  />
                ))
              ) : (
                <div className="no-reels">

                  <div className="emojis-reels">
                    {activeTab === "my" ? '❌🎥' : '🎥'}
                    </div>
                  <p>
                  {activeTab === 'my' ?  'No has creado ningún reel todavía.':
                     'No hay reels disponibles.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <div className="modal-create-reels">
        <Modal
          isOpen={modalOpen}
          closeModal={() => setModalOpen(false)}
          className="modal-reels"
        >
          <div className="header-modal-reels">
            <h2>Sube un nuevo video</h2>
            <div className="onclose-modal-reels">
            <i className="fa-solid fa-xmark" onClick={() => setModalOpen(false)} ></i>
            </div>

          </div>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del video..."
          ></textarea>
<div className="conten-video cursor-pointer">
  {!videoFile && (
    <>
      <IoVideocamOutline />
      <input
        type="file"
        id="video-upload"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
          } else {
            setVideoFile(null);
          }
        }}
      />
      <label
        htmlFor="video-upload"
        className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap text-sm hover:translate-y-[-3px]"
        >
        <FaUpload className="text-lg" />
        Subir Video
      </label>
    </>
  )}

  {/* Si hay un video, se muestra en pantalla ocupando el 100% del contenedor */}
  {videoFile && (
        <div className="preview-video w-full h-full flex flex-col justify-center items-center"
        >
          <video
            className="reel-video max-w-full max-h-full object-contain transition-transform duration-300"
            src={URL.createObjectURL(videoFile)}
            controls
         />
          <div className="OptionReels-modal">
      <i
        className="fa-solid fa-xmark DeleteVideo"
        onClick={handleDeleteVideo}
      ></i>
          </div>

        </div>
      )}
</div>

          
          <button
            className="publicar-reels"
            onClick={async () => {
              if (!videoFile) {
                alert("Por favor selecciona un video");
                return;
              }

              const formData = new FormData();
              formData.append("usuario_id", userId);
              formData.append("descripcion", descripcion);
              formData.append("archivo_video", videoFile);

              try {
                await createReel(formData);
                setModalOpen(false);
                setVideoFile(null);
                setDescripcion("");
                // Recargar lista de reels
                const updatedReels = await getAllReels();
                setReels(updatedReels);
              } catch (error) {
                console.error("Error al publicar reel:", error);
                alert("Error al publicar el reel");
              }
            }}
          >
            <i className="fa-regular fa-paper-plane"></i>
            Publicar
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default Reels;

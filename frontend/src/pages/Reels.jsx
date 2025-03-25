import React, { useState, useEffect } from "react";
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
                <button className="tab-reel-1">Guardados</button>
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
                  {activeTab === "my"
                    ? "No has creado ningún reel todavía."
                    : "No hay reels disponibles."}
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
            <h4>X</h4>
            {/* iconSalir */}
          </div>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del video..."
          ></textarea>
          <div className="conten-video cursor-pointer">
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
              className="flex items-center gap-2 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap text-xl"
            >
              <FaUpload className="text-lg" />
              {videoFile ? videoFile.name : "Subir Video"}
            </label>
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

import React, { useState, useEffect } from "react";
import "../../assets/css/setting/setting.css"; // Archivo de estilos
import { LuSettings } from "react-icons/lu";
import { FiLock, FiUsers, FiGlobe, FiMic, FiFile, FiEye } from "react-icons/fi";
import {
  updatePrivacySettings,
  getUserSettings,
  updateUserSettings,
} from "../../services/users";
import { toast } from "react-toastify";
import socket from "../../services/socket";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [privacy, setPrivacy] = useState("publico");
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [filesAccessEnabled, setFilesAccessEnabled] = useState(true);
  const [onlineVisibilityEnabled, setOnlineVisibilityEnabled] = useState(true);
  const [language, setLanguage] = useState("es");
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const userId = localStorage.getItem("userId");

  // Fetch current privacy settings when component mounts
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // Fetch user settings from backend
          const userSettings = await getUserSettings(userId);

          // Update state with fetched settings - convert numeric values to boolean
          setPrivacy(userSettings.privacidad || "publico");
          setNotificationsEnabled(!!userSettings.notificaciones);
          setAudioEnabled(!!userSettings.audio_enabled);
          setFilesAccessEnabled(!!userSettings.files_access_enabled);
          setOnlineVisibilityEnabled(!!userSettings.online_visibility);
          setLanguage(userSettings.idioma || "es");
          setAutoplayVideos(!!userSettings.autoplay_videos);

          // Update localStorage with fetched settings
          localStorage.setItem(
            "userPrivacy",
            userSettings.privacidad || "publico"
          );
          localStorage.setItem(
            "notificationsEnabled",
            !!userSettings.notificaciones
          );
          localStorage.setItem("audioEnabled", !!userSettings.audio_enabled);
          localStorage.setItem(
            "filesAccessEnabled",
            !!userSettings.files_access_enabled
          );
          localStorage.setItem(
            "onlineVisibilityEnabled",
            !!userSettings.online_visibility
          );
          localStorage.setItem("language", userSettings.idioma || "es");
          localStorage.setItem(
            "autoplayVideos",
            !!userSettings.autoplay_videos
          );
        } else {
          // If no token, use default values
          setPrivacy("publico");
          setNotificationsEnabled(false);
          setAudioEnabled(true);
          setFilesAccessEnabled(true);
          setOnlineVisibilityEnabled(true);
          setLanguage("es");
          setAutoplayVideos(true);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast.error("Error al cargar las configuraciones");

        // Use default values on error
        setPrivacy("publico");
        setNotificationsEnabled(false);
        setAudioEnabled(true);
        setFilesAccessEnabled(true);
        setOnlineVisibilityEnabled(true);
        setLanguage("es");
        setAutoplayVideos(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [userId]);

  const handleToggleNotifications = async () => {
    try {
      setLoading(true);
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);

      await updateUserSettings({ notificaciones: newValue });
      localStorage.setItem("notificationsEnabled", newValue);

      if (!newValue) {
        // Disconnect from notification room
        const userId = localStorage.getItem("userId");
        if (userId) {
          socket.emit("leave", userId);
        }
      } else {
        // Connect to notification room
        const userId = localStorage.getItem("userId");
        if (userId) {
          socket.emit("join", userId);
        }
      }

      toast.success(
        `Notificaciones ${newValue ? "habilitadas" : "deshabilitadas"}`
      );
    } catch (error) {
      console.error("Error al actualizar notificaciones:", error);
      toast.error("Error al actualizar la configuración");
      setNotificationsEnabled(!notificationsEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyChange = async (newPrivacy) => {
    try {
      setLoading(true);
      await updatePrivacySettings(newPrivacy);
      setPrivacy(newPrivacy);

      // Store in localStorage for persistence (temporary solution)
      localStorage.setItem("userPrivacy", newPrivacy);

      toast.success("Configuración de privacidad actualizada");
    } catch (error) {
      console.error("Error al actualizar privacidad:", error);
      toast.error("Error al actualizar la configuración de privacidad");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudio = async () => {
    try {
      setLoading(true);
      const newValue = !audioEnabled;
      setAudioEnabled(newValue);

      // Update in database with the correct field name
      await updateUserSettings({ audio_enabled: newValue ? 1 : 0 });

      // Update in localStorage
      localStorage.setItem("audioEnabled", newValue);

      // Request or revoke microphone permissions if needed
      if (newValue) {
        try {
          // Request microphone permission when enabling audio
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (permissionError) {
          console.warn("Microphone permission denied:", permissionError);
          toast.warning(
            "No se pudo acceder al micrófono. Verifica los permisos del navegador."
          );
        }
      }

      toast.success(
        `Grabación de audio ${newValue ? "habilitada" : "deshabilitada"}`
      );
    } catch (error) {
      console.error("Error al actualizar configuración de audio:", error);
      toast.error("Error al actualizar la configuración");
      // Revert state on error
      setAudioEnabled(!audioEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFilesAccess = async () => {
    try {
      setLoading(true);
      const newValue = !filesAccessEnabled;
      setFilesAccessEnabled(newValue);

      // Update in database with the correct field name
      await updateUserSettings({ files_access_enabled: newValue ? 1 : 0 });

      // Update in localStorage
      localStorage.setItem("filesAccessEnabled", newValue);

      // If enabling file access, test file system access if browser supports it
      if (newValue && window.showDirectoryPicker) {
        try {
          // This will prompt the user for directory access permission
          // Just to test if permissions are granted
          await window
            .showDirectoryPicker()
            .then(() => {
              toast.info("Acceso a archivos concedido correctamente");
            })
            .catch(() => {
              // User cancelled the picker, but that's okay
            });
        } catch (permissionError) {
          console.warn(
            "File system access API not fully supported:",
            permissionError
          );
        }
      }

      toast.success(
        `Acceso a archivos ${newValue ? "habilitado" : "deshabilitado"}`
      );
    } catch (error) {
      console.error("Error al actualizar configuración de archivos:", error);
      toast.error("Error al actualizar la configuración");
      // Revert state on error
      setFilesAccessEnabled(!filesAccessEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnlineVisibility = async () => {
    try {
      setLoading(true);
      const newValue = !onlineVisibilityEnabled;
      setOnlineVisibilityEnabled(newValue);

      // Update in database with the correct field name and convert boolean to 1/0
      await updateUserSettings({ online_visibility: newValue ? 1 : 0 });

      // Update in localStorage
      localStorage.setItem("onlineVisibilityEnabled", newValue);

      // Emit online status change to socket if connected
      if (socket && socket.connected) {
        // Update user's visibility status in real-time
        socket.emit("visibility_change", {
          userId,
          isVisible: newValue,
          status: newValue ? "conectado" : "invisible",
        });
      }

      // If turning visibility off, update user status to appear offline to others
      if (!newValue) {
        // Import the updateUserStatus function
        const { updateUserStatus } = await import("../../services/users");
        // Set user status to 'invisible' in the database
        await updateUserStatus(userId, "invisible");
      } else {
        // If turning visibility on, update user status to appear online
        const { updateUserStatus } = await import("../../services/users");
        // Set user status to 'conectado' in the database
        await updateUserStatus(userId, "conectado");
      }

      toast.success(
        `Visibilidad en línea ${newValue ? "habilitada" : "deshabilitada"}`
      );
    } catch (error) {
      console.error("Error al actualizar visibilidad en línea:", error);
      toast.error("Error al actualizar la configuración");
      // Revert state on error
      setOnlineVisibilityEnabled(!onlineVisibilityEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    try {
      setLoading(true);
      const previousLanguage = language;
      setLanguage(newLanguage);

      // Update in database
      await updateUserSettings({ idioma: newLanguage });

      // Update in localStorage
      localStorage.setItem("language", newLanguage);

      // Dispatch custom event to notify other components about the language change
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: newLanguage },
        })
      );

      toast.success(
        `Idioma cambiado a ${newLanguage === "es" ? "Español" : "English"}`
      );
    } catch (error) {
      console.error("Error al actualizar idioma:", error);
      toast.error("Error al actualizar la configuración");
      // Revert state on error
      setLanguage(previousLanguage); // Revert to previous language state
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoplayVideos = async () => {
    try {
      setLoading(true);
      const newValue = !autoplayVideos;
      setAutoplayVideos(newValue);

      // Update in database with the correct field name and convert boolean to 1/0
      await updateUserSettings({ autoplay_videos: newValue ? 1 : 0 });

      // Update in localStorage
      localStorage.setItem("autoplayVideos", newValue);

      // Dispatch custom event to notify other components about the setting change
      window.dispatchEvent(
        new CustomEvent("autoplaySettingChanged", {
          detail: { enabled: newValue },
        })
      );

      toast.success(
        `Reproducción automática de videos ${
          newValue ? "habilitada" : "deshabilitada"
        }`
      );
    } catch (error) {
      console.error("Error al actualizar configuración de videos:", error);
      toast.error("Error al actualizar la configuración");
      // Revert state on error
      setAutoplayVideos(!autoplayVideos);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="containerSetting">
      <div className="containerSettingHeader">
        <LuSettings className="iconSetting" />
        <h2>Configuraciones</h2>
      </div>
      <div className="containerSettingSubheader">
        <h3>Preferencias</h3>
        <p>Personaliza tu experiencia en BubbleBox.</p>
      </div>
      <div className="containerSettingItems">
        <div className="itemSetting">
          <h3>Notificaciones</h3>
          <div className="itemSettingContent">
            <p>
              Recibirás notificaciones sobre tus amigos, comunidades y eventos.
            </p>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="itemSetting">
          <h3>Privacidad del Perfil</h3>
          <div className="privacy-settings mt-2">
            <p className="mb-3">
              Controla quién puede ver tu perfil y tu información personal.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handlePrivacyChange("publico")}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  privacy === "publico"
                    ? "bg-purple-100 text-purple-600"
                    : "hover:bg-gray-100"
                }`}
                disabled={loading}
              >
                <FiGlobe size={18} />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Público</span>
                  <span className="text-xs text-gray-500">
                    Cualquiera puede ver tu perfil
                  </span>
                </div>
              </button>

              <button
                onClick={() => handlePrivacyChange("amigos")}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  privacy === "amigos"
                    ? "bg-purple-100 text-purple-600"
                    : "hover:bg-gray-100"
                }`}
                disabled={loading}
              >
                <FiUsers size={18} />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Solo amigos</span>
                  <span className="text-xs text-gray-500">
                    Solo tus amigos pueden ver tu perfil
                  </span>
                </div>
              </button>

              <button
                onClick={() => handlePrivacyChange("privado")}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  privacy === "privado"
                    ? "bg-purple-100 text-purple-600"
                    : "hover:bg-gray-100"
                }`}
                disabled={loading}
              >
                <FiLock size={18} />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Privado</span>
                  <span className="text-xs text-gray-500">
                    Solo tú puedes ver tu perfil
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Permitir grabar audio */}
        <div className="itemSetting">
          <h3>Grabación de Audio</h3>
          <div className="itemSettingContent">
            <p>Permitir grabar audio en mensajes y publicaciones.</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={handleToggleAudio}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Permitir acceder a archivos */}
        <div className="itemSetting">
          <h3>Acceso a Archivos</h3>
          <div className="itemSettingContent">
            <p>
              Permitir que la aplicación acceda a tus archivos para compartir.
            </p>
            <label className="switch">
              <input
                type="checkbox"
                checked={filesAccessEnabled}
                onChange={handleToggleFilesAccess}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Permitir que otros usuarios me vean en línea */}
        <div className="itemSetting">
          <h3>Visibilidad en Línea</h3>
          <div className="itemSettingContent">
            <p>Permitir que otros usuarios vean cuando estás conectado.</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={onlineVisibilityEnabled}
                onChange={handleToggleOnlineVisibility}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Reproducción automática de videos */}
        <div className="itemSetting">
          <h3>Reproducción Automática de Videos</h3>
          <div className="itemSettingContent">
            <p>
              Reproducir videos automáticamente cuando se envían desde otros
              usuarios.
            </p>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoplayVideos}
                onChange={handleToggleAutoplayVideos}
                disabled={loading}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

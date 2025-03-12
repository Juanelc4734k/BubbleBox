import React, { useState } from 'react';
import "../../assets/css/setting/setting.css"; // Archivo de estilos
import { LuSettings } from "react-icons/lu";

const Settings = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [privacyEnabled, setPrivacyEnabled] = useState(false);

    const handleToggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        console.log("Notificaciones:", !notificationsEnabled);
    };

    const handleTogglePrivacy = () => {
        setPrivacyEnabled(!privacyEnabled);
        console.log("Privacidad:", !privacyEnabled);
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
                        <p>Recibirás notificaciones sobre tus amigos, comunidades y eventos.</p>
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
                    <h3>Privacidad</h3>
                    <div className="itemSettingContent">
                        <p>Controla quién puede ver tus datos personales y cómo se usan.</p>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={privacyEnabled} 
                                onChange={handleTogglePrivacy} 
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

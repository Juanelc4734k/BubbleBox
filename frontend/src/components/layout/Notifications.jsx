import React, { useState, useEffect,useRef } from "react";
import { FaBell } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdMessage, MdPersonAdd, MdPeople, MdPhoto, MdComment, MdFavorite, MdDelete, MdMoreVert  } from "react-icons/md";
import { getNotification, markAsRead, deleteNotification } from "../../services/notification";
import { acceptFriendRequest, rejectFriendRequest } from "../../services/friends";
import socket from "../../services/socket";
import "../../assets/css/layout/notification.css";

// Configuración de pestañas de notificaciones
const NOTIFICATION_TABS = [
    { id: 'all', label: 'Todas', icon: <FaBell /> },
];


const EXTRA_TABS = [
    { id: 'all', label: 'Todas', icon: <FaBell /> },
    { id: 'message', label: 'Mensajes', icon: <MdMessage /> },
    { id: 'amistad_aceptada', label: 'Solicitudes Aceptadas', icon: <MdPeople /> },
    { id: 'solicitud_amistad', label: 'Solicitudes de Amistad', icon: <MdPersonAdd /> },
    { id: 'nueva_publicacion', label: 'Nuevas Publicaciones', icon: <MdPhoto /> },
    { id: 'post', label: 'Publicaciones de Amigos', icon: <MdPhoto /> },
    { id: 'comentario', label: 'Comentarios', icon: <MdComment /> },
    { id: 'reaccion', label: 'Reacciones', icon: <MdFavorite /> }
];

// NotificationBell Component
const NotificationBell = ({ count, onClick }) => (
    <button className="navbar-icon campana" aria-label="Notificaciones" onClick={onClick}>
        <FaBell />
        {count > 0 && <span className="notification-badge">{count}</span>}
    </button>
);

// NotificationHeader Component
const NotificationHeader = ({ onClose }) => (
    <div className="headerNoti">
        <h2 className="textNoti">Notificaciones</h2>
        <button className="closeNoti" onClick={onClose}>
            <IoClose/>
        </button>
    </div>
);

// NotificationTabs Component
const NotificationTabs = ({ activeTab, onTabChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return(
   <div className={`notification-tabs ${isMenuOpen ? "menu-open" : ""}`}>
        {(() => {
            const activeTabData = [...NOTIFICATION_TABS, ...EXTRA_TABS].find(tab => tab.id === activeTab);
            return activeTabData ? (
                <button className="tab-button active main-active-tab">
                    {activeTabData.icon}
                    <span>{activeTabData.label}</span>
                </button>
            ) : null;
        })()}

        {/* Botón de tres puntos para mostrar más opciones */}
        <div className="extra-options">
            <button className={`menu-button ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <MdMoreVert />
            </button>
            {isMenuOpen && (
                <div className={`menu-dropdown ${isMenuOpen ? "open" : ""} `}>
                    {EXTRA_TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                onTabChange(tab.id);
                                setIsMenuOpen(false); // Cerrar menú al seleccionar
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
    )
};

// EmptyNotifications Component
const EmptyNotifications = () => (
    <div className="notNoti">
        <FaBell className="iconNot" />
        <p className="textNotNoti">No hay notificaciones en esta categoría</p>
    </div>
);

// NotificationItem Component
const NotificationItem = ({ notification, onNotificationClick, onDelete, onFriendRequest }) => {
    const icon = NOTIFICATION_TABS.find(tab => tab.id === notification.tipo)?.icon;

    return (
        <div 
            className={`notification-item ${notification.leida ? 'read' : 'unread'}`}
            onClick={() => onNotificationClick(notification)}
        >
            {icon}
            <div className="notification-content">
           <p>{notification.contenido}</p>
                <span className="notification-time">
                <i className="fa-regular fa-clock"></i>
                    {new Date(notification.fecha_creacion).toLocaleTimeString()}
                </span>
                {notification.tipo === 'solicitud_amistad' && (
                    <div className="friend-request-actions">
                        <button 
                            className="accept-button"
                            onClick={(e) => onFriendRequest(e, notification.id, notification.referencia_id, 'accept')}
                        >
                            Aceptar
                        </button>
                        <button 
                            className="reject-button"
                            onClick={(e) => onFriendRequest(e, notification.id, notification.referencia_id, 'reject')}
                        >
                            Rechazar
                        </button>
                    </div>
                )}
            </div>
            <button 
                className="delete-notification"
                onClick={(e) => onDelete(e, notification.id)}
            >
            <i className="fa-solid fa-trash"></i>
            </button>
        </div>
    );
};

// Main Notifications Component
const Notifications = () => {
    const containerRef = useRef(null);
    const [isOpenNoti, setIsOpenNoti] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpenNoti(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setIsOpenNoti]);

    const handleNotificationClick = async (noti) => {
        if (!noti.leida) {
            try {
                await markAsRead(noti.id);
                setNotifications(prevNotifications => 
                    prevNotifications.map(n => 
                        n.id === noti.id ? { ...n, leida: true } : n
                    )
                );
            } catch (error) {
                console.error("Error al marcar como leída:", error);
            }
        }
    };

    const handleDeleteNotification = async (e, notiId) => {
        e.stopPropagation();
        try {
            const notification = notifications.find(n => n.id === notiId);
            if (notification?.tipo === 'solicitud_amistad') {
                await rejectFriendRequest(notification.referencia_id);
            }
            await deleteNotification(notiId);
            setNotifications(prev => prev.filter(noti => noti.id !== notiId));
        } catch (error) {
            console.error("Error al eliminar la notificación:", error);
        }
    };

    const handleFriendRequest = async (e, notiId, friendshipId, action) => {
        e.stopPropagation();
        try {
            if (action === 'accept') {
                await acceptFriendRequest(friendshipId);
            } else {
                await rejectFriendRequest(friendshipId);
            }
            await deleteNotification(notiId);
            setNotifications(prev => prev.filter(noti => noti.id !== notiId));
        } catch (error) {
            console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} friend request:`, error);
        }
    };

    useEffect(() => {
        const fetchNotificationsAndSettings = async () => {
            try {
                // Get user ID from localStorage
                const userId = localStorage.getItem('userId');
                if (!userId) return;
                
                // Check if notifications setting exists in localStorage
                let notificationsEnabledSetting = localStorage.getItem('notificationsEnabled');
                
                // If setting doesn't exist in localStorage, fetch from database
                if (notificationsEnabledSetting === null) {
                    try {
                        // Import the getUserSettings function
                        const { getUserSettings } = await import('../../services/users');
                        const userSettings = await getUserSettings(userId);
                        
                        // Update localStorage with fetched settings
                        notificationsEnabledSetting = !!userSettings.notificaciones;
                        localStorage.setItem('notificationsEnabled', notificationsEnabledSetting);
                    } catch (error) {
                        console.error("Error fetching user settings:", error);
                        // Default to enabled if there's an error
                        notificationsEnabledSetting = true;
                    }
                } else {
                    // Convert string to boolean
                    notificationsEnabledSetting = notificationsEnabledSetting !== 'false';
                }
                
                // Update state with the setting
                setNotificationsEnabled(notificationsEnabledSetting);
                
                // Only fetch notifications if they're enabled
                if (notificationsEnabledSetting) {
                    const data = await getNotification();
                    setNotifications(data);
                    
                    // Listen for new notifications
                    socket.on("nueva_notificacion", (nuevaNotificacion) => {
                        setNotifications(prev => [nuevaNotificacion, ...prev]);
                    });
                }
            } catch (error) {
                console.error("Error in fetchNotificationsAndSettings:", error);
            }
        };
        
        fetchNotificationsAndSettings();
        
        return () => socket.off("nueva_notificacion");
    }, []);

    // Listen for changes in notification settings
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'notificationsEnabled') {
                setNotificationsEnabled(e.newValue !== 'false');
                
                // If notifications were just enabled, fetch them
                if (e.newValue !== 'false') {
                    const fetchNotifications = async () => {
                        try {
                            const data = await getNotification();
                            setNotifications(data);
                        } catch (error) {
                            console.error("Error obteniendo las notificaciones", error);
                        }
                    };
                    
                    fetchNotifications();
                    
                    // Listen for new notifications
                    socket.on("nueva_notificacion", (nuevaNotificacion) => {
                        setNotifications(prev => [nuevaNotificacion, ...prev]);
                    });
                } else {
                    // If notifications were disabled, remove listeners
                    socket.off("nueva_notificacion");
                }
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const filteredNotifications = activeTab === 'all' 
        ? notifications 
        : notifications.filter(noti => noti.tipo === activeTab);

    const groupedNotifications = filteredNotifications.reduce((groups, noti) => {
        const date = new Date(noti.fecha_creacion).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(noti);
        return groups;
    }, {});

    return (
        <div className={`containerNoti ${isOpenNoti ? "active" : ""}`} ref={containerRef}>
            {notificationsEnabled ? (
                <>
                    <NotificationBell 
                        count={notifications.filter(noti => !noti.leida).length} 
                        onClick={() => setIsOpenNoti(!isOpenNoti)} 
                    />
                    {isOpenNoti && (
                        <div className="containerNotiOpen">
                            <NotificationHeader onClose={() => setIsOpenNoti(false)} />
                            <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />
                            
                            {filteredNotifications.length === 0 ? (
                                <EmptyNotifications />
                            ) : (
                                <div className="notifications-list">
                                    {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                                        <div key={date} className="notification-group">
                                            <div className="date-header">{date}</div>
                                            {dateNotifications.map((noti) => (
                                                <NotificationItem
                                                    key={noti.id}
                                                    notification={noti}
                                                    onNotificationClick={handleNotificationClick}
                                                    onDelete={handleDeleteNotification}
                                                    onFriendRequest={handleFriendRequest}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
};

export default Notifications;
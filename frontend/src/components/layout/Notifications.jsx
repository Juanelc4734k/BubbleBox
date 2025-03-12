import React, { useState, useEffect } from "react";
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
        {NOTIFICATION_TABS.map(tab => (
            <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
            >
                {tab.icon}
                <span>{tab.label}</span>
            </button>
        ))}

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
                <MdDelete />
            </button>
        </div>
    );
};

// Main Notifications Component
const Notifications = () => {
    const [isOpenNoti, setIsOpenNoti] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

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
        const fetchNotifications = async () => {
            try {
                const data = await getNotification();
                setNotifications(data);
            } catch (error) {
                console.error("Error obteniendo las notificaciones", error);
            }
        };

        fetchNotifications();
        
        socket.on("nueva_notificacion", (nuevaNotificacion) => {
            setNotifications(prev => [nuevaNotificacion, ...prev]);
        });

        return () => socket.off("nueva_notificacion");
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
        <div className={`containerNoti ${isOpenNoti ? "active" : ""}`}>
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
        </div>
    );
};

export default Notifications;
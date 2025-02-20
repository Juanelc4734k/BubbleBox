import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getNotification } from "../../services/notification";
import socket from "../../services/socket";
import "../../assets/css/layout/notification.css";

const Notifications = () => {
    const [isOpenNoti, setIsOpenNoti] = useState(false);
    const [isNotification, setIsNotification] = useState([]);
    
    useEffect(() => {
        //Obtener las notificaciones al cargar el componente 
        const fetchNotification = async () => {
            try {
                const data = await getNotification();
                setIsNotification(data);  
                
            } catch (error) {
                console.error("Error obteniendo las notificaciones", error);
            }
        };
        fetchNotification();
        socket.compress("nueva_notificacion", (nuevaNotificacion) => {
            setIsNotification(prev => [nuevaNotificacion, ...prev]);
        });

        return () => {
            socket.off("nueva_notificacion");
        };
    }, []);

    const toggleNotification = () => {
        setIsOpenNoti(!isOpenNoti);
    }

    return(
        <div className={`containerNoti ${isOpenNoti ? "active" : ""}`}>
            <button className="navbar-icon campana" aria-label="Notificaciones" onClick={toggleNotification}>
                <FaBell />
            </button>
            {isOpenNoti && (
                <div className="containerNotiOpen">
                    <div className="headerNoti">
                        <h2 className="textNoti" >Notificaciones nuevas</h2>
                        <button className="closeNoti" onClick={toggleNotification}>
                            <IoClose/>
                        </button>
                    </div>          
                    {isNotification.length === 0 ? (
                        <div className="notNoti">
                            <FaBell className="iconNot" />
                            <p className="textNotNoti">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <ul>
                            {isNotification.map((noti) => (
                                <li key={noti.id}>
                                    {noti.contenido}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications
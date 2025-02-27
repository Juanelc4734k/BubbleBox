import { useEffect, useState } from 'react';
import { getCommunities } from '../../services/comunity';
import { getUsers } from '../../services/users';
import '../../assets/css/comunity/community.css';
const Community = () => {
    const avatarUsuario = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
    const parrafoComm =" Únete a una comunidad";

    const [mostrarT, setMostrarT] = useState(true);
    const [noVer, setNoVer] = useState(false);
    const [textoM, setTextoM] = useState("");
    const [communities, setCommunities] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMostrarT(false);
            setTimeout(() => setNoVer(true), 1500);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        let i = 0;
        const escribir = setInterval(() => {
            if (i < parrafoComm.length) {
                setTextoM((prev) => (prev !== undefined ? prev + (parrafoComm[i] || '') : parrafoComm[i]));
                        i++;
            } else {
                clearInterval(escribir);
            }
        }, 100);
        
        return () => clearInterval(escribir);
    }, []);

    useEffect(() => {
        getCommunities().then(setCommunities);
        getUsers().then(setUsers);
    }, []);

    return (
        <div className="community-Conten">
            <div className='textOcul'>
                {!noVer && <h2 className={mostrarT ? "ver" : "noVer"}>{textoM}</h2>}
            </div>

            <div className='communitys'>
                {communities.map((community) => {
                    const creador = users.find(user => user.id === community.id_creador);
                    return (
                        <div key={community.id} className='communitys-Info' style={{ backgroundImage: `url(http://localhost:3004/uploads/${community.imagen})` }}>

                            <div className="datosOne">
                                <div className="datostwo">
                                    <div className="datoIcon">
                                        {creador && (
                                            <img 
                                                src={creador.avatar ? `http://localhost:3009${creador.avatar}` : avatarUsuario}
                                                alt={`${creador.nombre}'s avatar`}
                                                className="avatar-image"
                                            />
                                        )}
                                    </div>

                                    <div className="infouser">
                                        <h3>{community.nombre}</h3>
                                        <p className='fechacreate'>
                                            {community.fecha_creacion ? new Date(community.fecha_creacion).toLocaleString() : 'Fecha desconocida'}
                                        </p>
                                    </div>
                                </div>
                                <button type="button">Unirme</button>
                            </div>

                            <div className="infoCommunity">
                                <p>{community.descripcion}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Community;

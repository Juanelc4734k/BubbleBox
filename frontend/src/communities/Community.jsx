import { useEffect, useState } from 'react';
import { getCommunities } from '../services/comunity';
import { getUsers } from '../services/users';

const Community = () => {
    const [communities, setCommunities] = useState([]);
    const [users, setUsers] = useState([]);
    useEffect(() => {
        getCommunities().then(setCommunities);
        getUsers().then(setUsers);
    }, []);

    return (
        <div className="mt-32 ml-5 p-2 bg-purple-300 w-[50vh] rounded-b-md">
            {communities.map((community) => (
                <div key={community.id}>
                    <h2>{community.nombre}</h2>
                    <p>{community.descripcion}</p>
                    <p>{users.find(user => user.id === community.id_creador)?.nombre}</p>
                </div>
            ))}
        </div>
    );
};

export default Community;

import React from 'react';

const Sidebar = ({ role }) => {
    const menuOptions = {
        admin: [
            { name: 'Dashboard', link: '/' },
            { name: 'Buscador', link: '/buscador' },
            { name: 'Videos', link: '/admin/videos' },
            { name: 'Chats', link: '/admin/' },
            { name: 'Perfil', link: '/perfil' },
            { name: 'Administrar Usuarios', link: '/admin/usuarios' },
        ],
        user: [
            { name: 'Home', link: '/' },
            { name: 'Buscador', link: '/buscador' },
            { name: 'Videos', link: '/videos' },
            { name: 'Amigos', link: '/amigos' },
            { name: 'Chats', link: '/chats' },
            { name: 'Musica', link: '/musica' },
            { name: 'Perfil', link: '/perfil' },
        ],
        employee: [
            { name: 'Home', link: '/' },
            { name: 'Buscador', link: '/buscador' },
            { name: 'Reportes', link: '/reportes' },
            { name: 'Tareas', link: '/tareas' },
            { name: 'Perfil', link: '/perfil' },
        ]
    };

    const options = menuOptions[role] || [];

    return (
        <div className='sidebar'>
            <ul>
                {options.map(option => (
                    <li key={option.name} ><a href={option.link}>{option.name}</a></li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
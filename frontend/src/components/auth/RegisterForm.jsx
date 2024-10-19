import React, { useState } from 'react';
import { register } from '../../services/auth';
import '../../assets/css/auth/resgistro.css';
import Animation from '../../assets/images/icon_login.png';
import iconoGoogle from '../../assets/images/cromo.png';
import iconoFacebook from '../../assets/images/facebook.png';
import iconoInstagram from '../../assets/images/instragram.png';

export default function RegisterForm({ setMessage }) {
    const [formData, setFormData] = useState({ nombre: '', username: '', email: '', contraseña: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register(formData);
            setMessage(response.message);
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    return (

        <div className="registerFrom">
            <div className="bienvenidoRegister">
                <h1>Bienvenido a BubbleBox</h1>
                <img src={Animation} alt="" className="registerAnimation" />
            </div>
            <div className="FormularioRegister">
                <form onSubmit={handleSubmit}>
                    <h2>Registrate</h2>
                    <label htmlFor="Nombre">Nombre</label>
                    <input type="text" name='nombre' value={formData.nombre} onChange={handleChange} required/>
                    <label htmlFor="Username">User name</label>
                    <input type="text" name='username' value={formData.username} onChange={handleChange} required/>
                    <label htmlFor="email">Correo</label>
                    <input type="email" name='email' value={formData.email} onChange={handleChange} required/>
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" name='contraseña' value={formData.contraseña} onChange={handleChange} required/>
                   <div className="iconos-register">
                   <div className="icono"><img src={iconoGoogle} alt="Icono de Google"/></div>
                        <div className="icono"><img src={iconoFacebook} alt="Icono de Facebook"/></div>
                        <div className="icono"><img src={iconoInstagram} alt="Icono de Instagram"/></div>
                   </div>
                    <button type="submit">Registrate</button>
                </form>
            </div>
           
        </div>
        
    );
};



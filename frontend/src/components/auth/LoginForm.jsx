import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../../services/auth';
import '../../assets/css/auth/login.css';
import logoAnimado from '../../assets/images/icon_login.png';
import iconGoogle from '../../assets/images/cromo.png';
import iconFacebook from '../../assets/images/facebook.png';
import iconInstagram from '../../assets/images/instragram.png';

export default function LoginForm({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({ email: '', contraseña: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData);
            setMessage(response.message);
            localStorage.setItem('token', response.token);
            setIsAuthenticated(true);
            navigate('/home');
        } catch (error) {
            setMessage(error.message);
        }
    };
    
    return (
        <div className="form">
            <div className="text">
                <h1>Bienvenidos a BubbleBox</h1>
                <div className="animacion">
                    <img src={logoAnimado} alt="icono"/>
                </div>
            </div>
            <div className="formulario">
                <form onSubmit={handleSubmit}>
                    <h2>Iniciar Sesión</h2>
                    <label htmlFor="email">Correo</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />
                    <div className="recuperar">
                        <Link to ="" className='recuperarContraseña'>Recuperar Contraseña</Link>
                    </div>
                    <div className="icons">
                        <div className="icono"><img src={iconGoogle} alt="Icono de Google"/></div>
                        <div className="icono"><img src={iconFacebook} alt="Icono de Facebook"/></div>
                        <div className="icono"><img src={iconInstagram} alt="Icono de Instagram"/></div>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
            <div className="otro">
               <p>¿No tienes una cuenta?</p>
                <Link to ="/register" className='registro'>Crear Cuenta</Link> 
            </div>
            
        </div>
    );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../../services/auth';
import '../../assets/css/auth/login.css';
import logoAnimado from '../../assets/images/icon_login.png';
import iconGoogle from '../../assets/images/cromo.png';
import iconFacebook from '../../assets/images/facebook.png';
import iconInstagram from '../../assets/images/instragram.png';
import fondoLogin from  '../../assets/images/img/login.jpeg';


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
            console.log('Intentando iniciar sesión con:', formData);
            console.log('Llamando a la función login...');
            const response = await login(formData);
            console.log('Respuesta recibida del servidor:', response);
            
            if (!response || !response.token) {
                console.error('La respuesta no contiene un token:', response);
                throw new Error('Respuesta inválida del servidor');
            }
            
            setMessage(response.message);
            localStorage.setItem('token', response.token);

            console.log('Decodificando el token...');
            const decodedToken = JSON.parse(atob(response.token.split('.')[1]));
            console.log('Token decodificado:', decodedToken);
            
            localStorage.setItem('userId', decodedToken.userId);
            localStorage.setItem('userRole', decodedToken.rol);
            setIsAuthenticated(true);

            if (decodedToken.rol === 'administrador') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error completo:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                console.error('Estado HTTP:', error.response.status);
                setMessage(error.response.data.mensaje || 'Error en la respuesta del servidor');
            } else if (error.request) {
                console.error('No se recibió respuesta del servidor');
                setMessage('No se pudo conectar con el servidor');
            } else {
                console.error('Error al configurar la solicitud:', error.message);
                setMessage('Error al intentar iniciar sesión');
            }
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
                        <Link to ="/recover-password" className='recuperarContraseña'>Recuperar Contraseña</Link>
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
            {message && <p>{message}</p>}
        </div>
    );
}
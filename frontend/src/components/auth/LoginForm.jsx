import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../../services/auth';
import '../../assets/css/auth/login.css';
import logoAnimado from '../../assets/images/icon_login.png';
import iconGoogle from '../../assets/images/cromo.png';
import iconFacebook from '../../assets/images/facebook.png';
import iconInstagram from '../../assets/images/instragram.png';
import fondoLogin from  '../../assets/images/img/fondo1.jpeg';
import { HiOutlineMail } from 'react-icons/hi';
import { SlLock } from 'react-icons/sl';
import logo from '../../assets/images/logo/logo.jfif'

export default function LoginForm({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({ email: '', contraseña: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Limpiar error al cambiar los campos
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log('Intentando iniciar sesión con:', formData);
            const response = await login(formData);
            
            if (!response || !response.token) {
                setError('Error: Respuesta inválida del servidor');
                return;
            }
            
            setMessage(response.message);
            localStorage.setItem('token', response.token);

            const decodedToken = JSON.parse(atob(response.token.split('.')[1]));
            
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
                const errorMessage = error.response.data.mensaje || 'Error en la respuesta del servidor';
                setError(errorMessage);
                console.error('Estado HTTP:', error.response.status);
            } else if (error.request) {
                setError('No se pudo conectar con el servidor');
            } else {
                setError('Error al intentar iniciar sesión');
            }
        }
    };
    
    return (
        <>
        <div className="containerGeneral">
            <div className="form">
            <div className="text">
                <h1>Bienvenidos a BubbleBox</h1>
                <img src={logo} alt="icono"/>
            </div>
            <div className="formulario">
                <form onSubmit={handleSubmit}>
                    <h2>Iniciar Sesión</h2>
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                    <label htmlFor="email">Correo</label>
                    <div className='containerIconEmail'>
                        <div className='iconLoginEmail'><HiOutlineMail/></div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required /> 
                        <div className='line'></div>
                    </div>
                    <label htmlFor="password">Contraseña</label>
                    <div className='containerIconPassword'>
                        <div className='iconLoginPassword'><SlLock/></div>
                        <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />   
                        <div className='line line2'></div>
                    </div>
                    
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
        </div>
        </>
    );
}
import React, { useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import '../../assets/css/auth/resgistro.css';
import Animation from '../../assets/images/logo/logo.jfif';
import { FaRegUser } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { SlLock } from 'react-icons/sl';
import { RiInstagramFill } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import Swal from "sweetalert2";

export default function RegisterForm({ setMessage }) {
    const [formData, setFormData] = useState({ nombre: '', username: '', email: '', contraseña: '' });
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Validaciones
    const validateForm = () => {

        if (!formData.nombre.trim() || !formData.username.trim() || !formData.email.trim() || !formData.contraseña.trim()) {
            setError("Todos los campos son obligatorios.");
            return false;
        }

        if (formData.nombre.trim().length < 3) {
            setError("El nombre debe tener al menos 3 caracteres.");
            return false;
        }
        if (formData.username.trim().length < 3) {
            setError("El nombre de usuario debe tener al menos 3 caracteres.");
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            setError("Ingrese un correo electrónico válido.");
            return false;
        }
        if (formData.contraseña.length < 5 || !/\d/.test(formData.contraseña) || !/[a-zA-Z]/.test(formData.contraseña)) {
            setError("La contraseña debe tener al menos 6 caracteres y contener letras y números.");
            return false;
        }
        setError(""); // Limpiar error si todo está bien
        return true;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Limpiar el error cuando el usuario empieza a escribir
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Detener el envío si hay errores
        try {
            const response = await register(formData);
            setMessage(response.message);

            // Muestra la alerta y redirige solo al hacer clic en el botón
            Swal.fire({
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada con éxito. Ahora inicia sesión.',
                icon: 'success',
                confirmButtonText: 'Iniciar sesión',
                allowOutsideClick: false, // Evita que se cierre si se hace clic afuera
                allowEscapeKey: false // Evita que se cierre con la tecla Escape
            }).then(() => {
                navigate('/login'); // Redirige al usuario al inicio de sesión
            });
        } catch (error) {
            setMessage(error.response?.data?.message || "Error en el registro.");
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
                    {error && <div className="errorMessageRegister">{error}</div>}
                    <div className="contaiName">
                        <div className="iconame"><FaRegUser/></div>
                        <input type="text" name='nombre' className='inpuName' value={formData.nombre} onChange={handleChange} placeholder='Nombre'/>
                        <div className='linea'></div>
                    </div>

                    <div className="contaiUsername">
                        <div className="iconUsername"><FaRegUser/></div>
                        <input type="text" name='username' className='inpuUsername' value={formData.username} onChange={handleChange} placeholder='User name'/>
                        <div className='linea'></div>
                    </div>

                    <div className="contaiEmail">
                        <div className="iconEmail"><HiOutlineMail/></div>
                        <input type="email" name='email'  className='inpuEmail' value={formData.email} onChange={handleChange} placeholder='Email' />
                        <div className='linea'></div>
                    </div>

                    <div className="contaiPassword">
                        <div className="iconPass"><SlLock/></div>
                        <input type="password" name='contraseña' className='inpuPass' value={formData.contraseña} onChange={handleChange} placeholder='Contraseña' />
                        <div className='linea'></div>
                    </div>

                   <div className="iconos-register">
                        <FaFacebookF className='iconoRe'/>
                        <FaGoogle className='iconoRe'/>
                        <RiInstagramFill className='iconoRe'/>
                   </div>
                    <button type="submit">Registrate</button>
                </form>
            </div>
           
        </div>
        
    );
}



import React, { useState } from 'react';
import { register } from '../../services/auth';

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
        <form onSubmit={handleSubmit}>
            <input type="text" name='nombre' placeholder='Nombre' value={formData.nombre} onChange={handleChange} required/>
            <input type="text" name='username' placeholder='Username' value={formData.username} onChange={handleChange} required/>
            <input type="email" name='email' placeholder='Correo' value={formData.email} onChange={handleChange} required/>
            <input type="password" name='contraseña' placeholder='Contraseña' value={formData.contraseña} onChange={handleChange} required/>
            <button type="submit">Registrate</button>
        </form>
    );
};



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';

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
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required />
            <input type="password" name="contraseña" placeholder="Contraseña" value={formData.contraseña} onChange={handleChange} required />
            <button type="submit">Login</button>
        </form>
    );
}
import { useState } from 'react';
import axios from 'axios';

const RecoverPass = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/auth/recover-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error al recuperar la contraseña:', error);
            setMessage('Error al enviar el correo de recuperación');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" 
                    required 
                />
                <button type="submit">Recuperar</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RecoverPass;
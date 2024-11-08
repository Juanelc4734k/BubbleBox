import { useState } from 'react';
import { resetPassword } from '../../services/auth';

const ResetPassComponent = ({ token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            return;
        }
        try {
            const response = await resetPassword(token, password);
            setMessage(response.mensaje);
        } catch (error) {
            setMessage('Error al restablecer la contraseña: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Nueva contraseña" 
                    required 
                />
                <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirmar contraseña" 
                    required 
                />
                <button type="submit">Restablecer</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassComponent;
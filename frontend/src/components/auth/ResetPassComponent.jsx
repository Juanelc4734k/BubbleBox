import { useState } from 'react';
import { resetPassword } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo/logo.jfif';
import '../../assets/css/auth/ResetPass.css';
import { HiOutlineMail } from 'react-icons/hi';
import Swal from 'sweetalert2';

const ResetPassComponent = ({ token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await resetPassword(token, password);
            setMessage(response.mensaje);
            Swal.fire({
                title: 'Contraseña restablecida',
                text: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
                icon: 'success',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            setError('Error al restablecer la contraseña: ' + error.message);
        }
    };

    return (
        <div className="containerGeneralReset">
            <div className="form">
                <div className="text">
                    <h1>Restablecer Contraseña</h1>
                    <img src={logo} alt="icono" />
                    <div className="conten-bubbles-login">
                <div className="bubbles1"></div>
                <div className="bubbles2"></div>
                <div className="bubbles3"></div>
                <div className="bubbles4"></div>
                <div className="bubbles5"></div>
                <div className="bubbles6"></div>
                <div className="bubbles7"></div>
                <div className="bubbles8"></div>

                </div>
                </div>
                <div className="formulario">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <label htmlFor="password">Nueva Contraseña</label>
                        <div className='containerrecover'>
                            <div className='iconResetContra'><HiOutlineMail/></div>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Nueva contraseña" 
                                required 
                            />
                            <div className='line'></div>
                        </div>
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <div className='containerrecover'>
                            <div className='iconResetContra'><HiOutlineMail/></div>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirmar contraseña" 
                                required 
                            /> 
                            <div className='line'></div>
                        </div>
                        
                        <button className='buttonLogin' type="submit">Restablecer</button>
                    </form>
                </div>
                {message && <p className="success-message">{message}</p>}
                <div className="otro">
                    <p>¿Ya tienes cuenta?</p>
                    <Link to="/login" className='registro'>Inicia Sesión</Link> 
                </div>
            </div>
        </div>
    );
};

export default ResetPassComponent;

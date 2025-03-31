import { useState } from 'react';
import axios from 'axios';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import Swal from 'sweetalert2';  // Importa SweetAlert2
import '../../assets/css/auth/password.css';
import { MdLockReset } from "react-icons/md"; 

const RecoverPass = () => {
    const [email, setEmail] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/auth/recover-password', { email });
            // Usar SweetAlert2 para mostrar el mensaje de respuesta
            if (response.data.mensaje) {
                Swal.fire({
                    title: 'Éxito',
                    text: response.data.mensaje,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar la solicitud',
                    icon: 'error',
                    confirmButtonText: 'Reintentar',
                });
            }
        } catch (error) {
            console.error('Error al recuperar la contraseña:', error);
            // Mostrar un mensaje de error usando SweetAlert2
            if (error.response && error.response.data) {
                Swal.fire({
                    title: 'Error',
                    text: error.response.data.mensaje || 'Error al enviar el correo de recuperación',
                    icon: 'error',
                    confirmButtonText: 'Reintentar',
                });
            } else {
                Swal.fire({
                    title: 'Error en el servidor',
                    text: 'Intente de nuevo más tarde',
                    icon: 'error',
                    confirmButtonText: 'Reintentar',
                });
            }
        }
    };

    return (
        <div className='bg-zinc-200 p-2 rounded-xl shadow'>
            <form onSubmit={handleSubmit}>
                <div className='Recover'>
                    <div className="iconEma bg-purple-500">
                        <MdOutlineMarkEmailUnread />
                    </div>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email" 
                        required 
                        className='pl-12 p-2 rounded-xl overflow-hidden'
                    />
                    <div className="linee bg-purple-500"></div>
                </div>
                <button 
                    className='bg-purple-500 mt-7 p-2 pl-6 pr-8  flex text-white rounded-lg buttonPass' 
                    type="submit"
                >
                    <MdLockReset className="text-lg mr-2 mt-[3px]" />
                    Recuperar
                </button>
            </form>
        </div>
    );
};

export default RecoverPass;

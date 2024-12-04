import { useState } from 'react';
import axios from 'axios';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import '../../assets/css/auth/password.css';
import { MdLockReset } from "react-icons/md"; 


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
        <div className='bg-zinc-200 p-6 rounded-xl shadow'>
            <form onSubmit={handleSubmit}>
                <div className='Recover'>
                    <div className="iconEma bg-purple-500">
                        <MdOutlineMarkEmailUnread/>
                    </div>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email" 
                        required 
                        className='w-full pl-12 p-2 rounded-xl '
                    />
                    <div className="linee bg-purple-500"></div>
                </div>
                    <button 
                        className='bg-purple-500 mt-5 p-2 pl-6 pr-8 ml-52 flex text-white rounded-lg' type="submit">
                        <MdLockReset className="text-lg mr-2 mt-[3px]" />
                        Recuperar
                    </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RecoverPass;
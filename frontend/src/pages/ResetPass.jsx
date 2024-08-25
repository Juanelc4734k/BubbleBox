import React from 'react'
import { useSearchParams, Link } from 'react-router-dom';
import ResetPassComponent from '../components/auth/ResetPassComponent';

const ResetPass = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    return (
        <div>
            <h1>Restablecer contraseña</h1>
            <ResetPassComponent token={token} />
            <Link to='/login'>Iniciar sesión</Link>
        </div>
    );
};

export default ResetPass;
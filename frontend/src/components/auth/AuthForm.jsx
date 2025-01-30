import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../../assets/css/auth/AuthForm.css';

export default function AuthForm() {
    const [isLoginActive, setIsLoginActive] = useState(true);

    const toggleActiveForm = () => {
        setIsLoginActive(!isLoginActive);
    };

    return (
        <div className={`auth-container ${isLoginActive ? 'login-active' : 'register-active'}`}>
            <div className="form-box">
                {isLoginActive ? <LoginForm /> : <RegisterForm />}
            </div>
            <div className="toggle-section">
                {isLoginActive ? (
                    <p>
                        ¿No tienes una cuenta? <button onClick={toggleActiveForm}>Crear Cuenta</button>
                    </p>
                ) : (
                    <p>
                        ¿Ya tienes una cuenta? <button onClick={toggleActiveForm}>Iniciar Sesión</button>
                    </p>
                )}
            </div>
        </div>
    );
}

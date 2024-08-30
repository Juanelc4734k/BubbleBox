import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';


const Login = ({ setIsAuthenticated }) => {
  const [message, setMessage] = useState('');

  return (
    <div>
      {/*<h1>Login</h1>*/}
      <LoginForm setMessage={setMessage} setIsAuthenticated={setIsAuthenticated} />
      <Link to="/recover-password">Recover Password</Link><br />
      <Link to="/register">¿No tienes una cuenta? Regístrate</Link>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
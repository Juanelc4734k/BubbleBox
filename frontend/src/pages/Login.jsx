import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';
import '../assets/css/auth/login.css'


const Login = ({ setIsAuthenticated }) => {
  const [message, setMessage] = useState('');

  return (
    <div  className="login">

      {/*<h1>Login</h1>*/}
      <LoginForm setMessage={setMessage} setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Login;
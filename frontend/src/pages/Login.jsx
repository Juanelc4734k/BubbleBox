import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';


const Login = ({ setIsAuthenticated }) => {
  const [message, setMessage] = useState('');

  return (
    <div>
      {/*<h1>Login</h1>*/}
      <LoginForm setMessage={setMessage} setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Login;
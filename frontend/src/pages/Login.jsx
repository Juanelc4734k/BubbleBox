import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';


const Login = ({ setIsAuthenticated }) => {
  const [message, setMessage] = useState('');

  return (
    <div>
      {/*<h1>Login</h1>*/}
      <LoginForm setMessage={setMessage} setIsAuthenticated={setIsAuthenticated} />
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
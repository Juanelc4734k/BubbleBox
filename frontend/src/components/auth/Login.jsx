import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loggedIn, setLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setLoggedIn(true);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {loggedIn ? <Navigate to="/profile" /> : (
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username" 
            onChange={handleChange} 
            value={form.username} 
            placeholder="Username" 
          />
          <input 
            type="password" 
            name="password" 
            onChange={handleChange} 
            value={form.password} 
            placeholder="Password" 
          />
          <button type="submit">Login</button>
          <p>No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </form>
      )}
    </>
  );
};

export default Login;

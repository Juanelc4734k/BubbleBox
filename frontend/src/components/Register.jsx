import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      console.log(res.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" onChange={handleChange} value={form.username} placeholder="Username" />
      <input type="email" name="email" onChange={handleChange} value={form.email} placeholder='Email'/>
      <input type="password" name="password" onChange={handleChange} value={form.password} placeholder="Password" />
      <select name="role" onChange={handleChange} value={form.role}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
        <option value="employee">Employee</option>
      </select>
      <button type="submit">Register</button>
      <p>Ya tienes una cuenta? <Link to="/login">Inicia sesion Aqui</Link></p>
    </form>
  );
};

export default Register;

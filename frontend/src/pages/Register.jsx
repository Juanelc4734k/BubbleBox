import React, { useState } from "react";
import RegisterForm from "../components/auth/RegisterForm";
import '../assets/css/auth/resgistro.css';
import { Link } from "react-router-dom";
const Register = () => {
  const [message, setMessage] = useState("");
  return (
    
    <div className="linkLogin">
      <RegisterForm setMessage={setMessage} />
      {message && <p>{message}</p>}
      <div className="Link-Sesion">
        <p>¿Ya tienes una cuenta?</p>
        <Link to="/login" className="link">Inicia sesión</Link>
      </div>
    </div>
  );
};

export default Register;

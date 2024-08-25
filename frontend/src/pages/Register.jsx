import React, { useState } from "react";
import RegisterForm from "../components/auth/RegisterForm";
import { Link } from "react-router-dom";

const Register = () => {
  const [message, setMessage] = useState("");
  return (
    <div>
      <h1>Register</h1>
      <RegisterForm setMessage={setMessage} />
      <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;

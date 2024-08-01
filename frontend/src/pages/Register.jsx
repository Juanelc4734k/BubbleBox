import React, { useState } from "react";
import RegisterForm from "../components/auth/RegisterForm";

const Register = () => {
  const [message, setMessage] = useState("");
  return (
    <div>
      <h1>Register</h1>
      <RegisterForm setMessage={setMessage} />
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;

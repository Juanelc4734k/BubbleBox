import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { login } from "../../services/auth";
import "../../assets/css/auth/login.css";
import fondoLogin from "../../assets/images/img/fondo1.jpeg";
import { HiOutlineMail } from "react-icons/hi";
import { SlLock } from "react-icons/sl";
import logo from "../../assets/images/logo/logo.jfif";
import { FaRegSquare, FaRegCheckSquare } from "react-icons/fa";
import Swal from "sweetalert2";

export default function LoginForm({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({ email: "", contraseña: "" });
  const [aceptado, setAceptado] = useState(false); // Estado para el checkbox de términos y condiciones
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Limpiar error al cambiar los campos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login(formData);

      if (!response || !response.token) {
        setError("Error: Respuesta inválida del servidor");
        return;
      }

      setMessage(response.message);
      const decodedToken = JSON.parse(atob(response.token.split(".")[1]));

      if (decodedToken.estado === "suspendido") {
        setError(
          "Tu cuenta ha sido suspendida. Por favor, contacta con el administrador."
        );
        return;
      }

      if (!aceptado) {
        // Validación para asegurarse de que se haya aceptado los términos
        setError("Debe aceptar los términos y condiciones.");
        return false;
      }

      // Only set localStorage items for non-admin users
      if (decodedToken.rol !== "administrador") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", decodedToken.userId);
        localStorage.setItem("userRole", decodedToken.rol);
      }

      // Muestra la alerta sin cerrar automáticamente
      Swal.fire({
        title: "¡Inicio de sesión exitoso!",
        text: "Bienvenido a BubbleBox",
        icon: "success",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        if (decodedToken.rol === "administrador") {
          window.location.href = `http://localhost:9090/?token=${response.token}`;
        } else {
          setIsAuthenticated(true);
          navigate("/home");
        }
      });
      //setIsAuthenticated(true);

      // Muestra la alerta sin cerrar automáticamente
      Swal.fire({
        title: "¡Inicio de sesión exitoso!",
        text: "Bienvenido a BubbleBox",
        icon: "success",
        allowOutsideClick: false, // Evita que se cierre haciendo clic fuera
        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
      }).then(() => {
        // Redirección solo cuando el usuario haga clic en "Ir a la página"
        if (decodedToken.rol === "administrador") {
          // Pass token as query parameter to Laravel dashboard
          window.location.href = `http://localhost:9090/?token=${response.token}`;
        } else {
          setIsAuthenticated(true);
          navigate("/home");
        }
      });
    } catch (error) {
      console.error("Error completo:", error);
      if (error.response) {
        const errorMessage =
          error.response.data.mensaje || "Error en la respuesta del servidor";
        setError(errorMessage);
        console.error("Estado HTTP:", error.response.status);
      } else if (error.request) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError("Error al intentar iniciar sesión");
      }
    }
  };

  return (
    <>
      <div className="containerGeneral">
        <div className="form">
          <div className="text">
            <h1>Bienvenidos a BubbleBox</h1>
            <img src={logo} alt="icono" />
            <div className="conten-bubbles-login">
              <div className="bubbles1"></div>
              <div className="bubbles2"></div>
              <div className="bubbles3"></div>
              <div className="bubbles4"></div>
              <div className="bubbles5"></div>
              <div className="bubbles6"></div>
              <div className="bubbles7"></div>
              <div className="bubbles8"></div>
            </div>
          </div>
          <div className="formulario">
            <form onSubmit={handleSubmit}>
              <h2>Iniciar Sesión</h2>
              {error && <div className="error-message">{error}</div>}
              <label htmlFor="email">Correo</label>
              <div className="containerIconEmail">
                <div className="iconLoginEmail">
                  <HiOutlineMail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div className="line"></div>
              </div>
              <label htmlFor="password">Contraseña</label>
              <div className="containerIconPassword">
                <div className="iconLoginPassword">
                  <SlLock />
                </div>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                />
                <div className="line line2"></div>
              </div>

              <div
                className="terminos-login"
                onClick={() => setAceptado(!aceptado)}
              >
                {aceptado ? (
                  <FaRegCheckSquare size={20} />
                ) : (
                  <FaRegSquare size={20} />
                )}
                <p>
                  Acepto los <span>Términos y Condiciones</span>
                </p>
              </div>

              <button className="buttonLogin" type="submit">
                Login
              </button>
              <div className="recuperar">
                <Link to="/recover-password" className="recuperarContraseña">
                  Recuperar Contraseña
                </Link>
              </div>
            </form>
          </div>
          <div className="otro">
            <p>¿No tienes una cuenta?</p>
            <Link to="/register" className="registro">
              Crear Cuenta
            </Link>
          </div>
          {message && <p>{message}</p>}
        </div>
      </div>
    </>
  );
}

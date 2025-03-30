import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, checkEmail } from "../../services/auth";
import "../../assets/css/auth/resgistro.css";
import Animation from "../../assets/images/logo/logo.jfif";
import { FaRegUser } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { SlLock } from "react-icons/sl";
import { FaRegSquare, FaRegCheckSquare } from "react-icons/fa";
import Swal from "sweetalert2";

export default function RegisterForm({ setMessage }) {
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    contraseña: "",
  });
  const [aceptado, setAceptado] = useState(false); // Estado para el checkbox de términos y condiciones
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const response = await checkEmail(email);

      // Validar estructura de respuesta
      if (!response || typeof response.existe !== "boolean") {
        console.error("Respuesta inválida del servidor:", response);
        return false;
      }
      return response.existe;
    } catch (error) {
      console.error("Error al verificar el correo electrónico:", error);
      return false; // Si ocurre un error, asumimos que el correo no está en uso
    }
  };

  // Sanitizar los valores de entrada antes de enviarlos
  const sanitizeInput = (input) => {
    return input.replace(/^\s+|\s+$/g, ""); // Eliminar espacios al inicio y al final
  };

  // Validaciones
  const validateForm = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.contraseña.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return false;
    }

    if (formData.nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return false;
    }

    if (/^\d+$/.test(formData.nombre.trim())) {
      setError("El nombre no puede ser solo números.");
      return false;
    }

    if (formData.username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return false;
    }

    if (/^\d+$/.test(formData.username.trim())) {
      setError("El nombre de usuario no puede ser solo números.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Ingrese un correo electrónico válido.");
      return false;
    }

    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      setError("El correo electrónico ya está en uso.");
      return false;
    }

    if (
      formData.contraseña.length < 5 ||
      !/\d/.test(formData.contraseña) ||
      !/[a-zA-Z]/.test(formData.contraseña)
    ) {
      setError(
        "La contraseña debe tener al menos 6 caracteres y contener letras y números."
      );
      return false;
    }

    if (!aceptado) {
      // Validación para asegurarse de que se haya aceptado los términos
      setError("Debe aceptar los términos y condiciones.");
      return false;
    }
    setError(""); // Limpiar error si todo está bien
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });
    // Limpiar el error cuando el usuario empieza a escribir
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      username: sanitizeInput(formData.username),
      email: sanitizeInput(formData.email),
      contraseña: sanitizeInput(formData.contraseña),
    };

    setFormData(sanitizedData);

    if (!(await validateForm())) return; // Detener el envío si hay errores
    try {
      const response = await register(sanitizedData);
      setMessage(response.message);

      // Muestra la alerta y redirige solo al hacer clic en el botón
      Swal.fire({
        title: "¡Registro exitoso!",
        text: "Tu cuenta ha sido creada con éxito. Ahora inicia sesión.",
        icon: "success",
        confirmButtonText: "Iniciar sesión",
        allowOutsideClick: false, // Evita que se cierre si se hace clic afuera
        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
      }).then(() => {
        navigate("/login"); // Redirige al usuario al inicio de sesión
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error en el registro.");
    }
  };

  return (
    <div className="registerFrom">
      <div className="bienvenidoRegister">
        <h1>Bienvenido a BubbleBox</h1>
        <img src={Animation} alt="" className="registerAnimation" />
        <div className="conten-bubbles-register">
          <div className="bubbless1"></div>
          <div className="bubbless2"></div>
          <div className="bubbless3"></div>
          <div className="bubbless4"></div>
          <div className="bubbless5"></div>
          <div className="bubbless6"></div>
          <div className="bubbless7"></div>
          <div className="bubbless8"></div>
        </div>
      </div>
      <div className="FormularioRegister">
        <form onSubmit={handleSubmit}>
          <h2>Registrate</h2>
          {error && <div className="errorMessageRegister">{error}</div>}
          <div className="contaiName">
            <div className="iconame">
              <FaRegUser />
            </div>
            <input
              type="text"
              name="nombre"
              className="inpuName"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
            />
            <div className="linea"></div>
          </div>

          <div className="contaiUsername">
            <div className="iconUsername">
              <FaRegUser />
            </div>
            <input
              type="text"
              name="username"
              className="inpuUsername"
              value={formData.username}
              onChange={handleChange}
              placeholder="User name"
              maxLength={30}
            />
            <div className="linea"></div>
          </div>

          <div className="contaiEmail">
            <div className="iconEmail">
              <HiOutlineMail />
            </div>
            <input
              type="text"
              name="email"
              className="inpuEmail"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <div className="linea"></div>
          </div>

          <div className="contaiPassword">
            <div className="iconPass">
              <SlLock />
            </div>
            <input
              type="password"
              name="contraseña"
              className="inpuPass"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="Contraseña"
            />
            <div className="linea"></div>
          </div>
          <div className="terminos" onClick={() => setAceptado(!aceptado)}>
            {aceptado ? (
              <FaRegCheckSquare size={20} />
            ) : (
              <FaRegSquare size={20} />
            )}
            <p>
              Acepto los <span>Términos y Condiciones</span>
            </p>
          </div>
          <button type="submit">Registrate</button>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * Punto de entrada principal de la aplicación React.
 * Renderiza el componente raíz <App /> en el elemento con id 'root'.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

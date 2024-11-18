# BubbleBox - Red Social 🫧

BubbleBox es una red social diseñada para unificar las funcionalidades de las plataformas sociales actuales, permitiendo a los usuarios reducir el consumo de recursos al tener múltiples redes abiertas al mismo tiempo.

---

## 🚀 Tecnologías Utilizadas

**Frontend:**
- **React.js**: Biblioteca para construir interfaces de usuario interactivas.
- **Vite**: Herramienta de construcción de proyectos con un enfoque en velocidad.

**Backend:**
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework minimalista para construir aplicaciones web en Node.js.

**Base de Datos:**
- **MySQL**: Sistema de gestión de bases de datos relacional.

---

## 📋 Requisitos Previos

Antes de comenzar con la instalación, asegúrate de tener las siguientes herramientas configuradas en tu sistema:

- **Node.js** (v18 o superior)
- **fnm** (Fast Node Manager) - Opcional, para gestionar versiones de Node.js.
- **Git** - Para clonar el repositorio.
- **MySQL** (v8 o superior) - Base de datos utilizada por la aplicación.

---

## 🚀 Instalación

Sigue los pasos a continuación para configurar y ejecutar el proyecto en tu máquina local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Juanelc4734k/BubbleBox.git
```

### 2. Configurar las variables de entorno

Crea el archivo .env en el directorio del backend:

```bash
# En /backend/
touch .env
```

Agrega las variables de entorno necesarias para la configuración de tu base de datos y otros servicios en este archivo.

### 3. Instalar las dependencias

Frontend

Instala las dependencias del frontend en el directorio correspondiente:

```bash
cd frontend
npm install
```

Backend

Instala las dependencias para los servicios del backend:

```bash
cd ../backend/services
npm install
```

Y para el API Gateway:

```bash
cd ../gateway
npm install
```

### 4.📁 Estructura del Proyecto

La estructura del proyecto es la siguiente:

```bash
proyecto/
├── frontend/          # Aplicación React + Vite
├── backend/
│   ├── services/      # Servicios de backend
│   ├── gateway/       # API Gateway
│   ├── scripts/       # Scripts de inicialización
│   └── .env           # Variables de entorno
```

### 🔧 Ejecución del Proyecto

1. Iniciar el servidor de base de datos MySQL

Asegúrate de que MySQL esté ejecutándose y que las configuraciones en el archivo .env estén correctas.

2. Iniciar el backend

Para iniciar los servicios del backend, ejecuta el siguiente comando:

```bash
cd backend/scripts
nodemon startAllServices.js
```

3. Iniciar el frontend

Una vez que el backend esté corriendo, inicia el servidor de desarrollo del frontend:

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en http://localhost:5173.

### 📜 Scripts Disponibles

Aquí hay algunos comandos útiles para el desarrollo:

```bash
npm run dev: Inicia el servidor de desarrollo (frontend).
npm run build: Genera la versión de producción.
npm run preview: Previsualiza la versión de producción generada.
```


### 📄 Licencia

Este proyecto está bajo la Licencia MIT.

### ✒️ Autores

- Juan Andres Toro - Trabajo Inicial - Juanelc4734k
- Yenifer Tamayo Villa - Trabajo Inicial - Yeniiiiii
- Mariana Andres Nisperuza - Trabajo Inicial - Mariana Nisperuza

### 🎁 Agradecimientos

Gracias a todos los que han contribuido en el desarrollo de este proyecto y a la comunidad de código abierto por su apoyo. ¡No dudes en compartir este proyecto con otros! 📢
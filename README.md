```markdown:README.md
# BubbleBox - Red Social 🫧

## Descripción
BubbleBox es una red social que unifica las distintas características de las redes sociales actuales para reducir el consumo de recursos que se tiene al momento de tener múltiples redes sociales abiertas.

## Tecnologías Utilizadas 🛠️
- Frontend:
  - React.js
  - Vite
- Backend:
  - Node.js
  - Express.js
- Base de datos:
  - MySQL

## Requisitos Previos 📋
- Node.js (v18 o superior)
- fnm (Fast Node Manager)
- Git
- MySQL (v8 o superior)

## Instalación 🚀

1. Clonar el repositorio:
```bash
git clone [https://github.com/Juanelc4734k/BubbleBox.git]
```

2. Configurar las variables de entorno:
```bash
# En /backend/
touch .env
```

3. Instalar dependencias:
```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias de los servicios del backend
cd ../backend/services
npm install

# Instalar dependencias del gateway
cd ../gateway
npm install
```

## Estructura del Proyecto 📁
```
proyecto/
├── frontend/          # Aplicación React + Vite
├── backend/
│   ├── services/      # Servicios de backend
│   ├── gateway/       # API Gateway
│   ├── scripts/       # Scripts de inicialización
│   └── .env           # Variables de entorno
```

## Ejecución del Proyecto 🔧
1. Iniciar el servidor de base de datos MySQL

2. Iniciar el backend:
```bash
# Iniciar servicios
cd backend/scripts
nodemon startAllServices.js
```

3. Iniciar el frontend:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles 📜
- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Genera la versión de producción
- `npm run preview`: Vista previa de la versión de producción


## Licencia 📄
Este proyecto está bajo la Licencia [MIT]

## Autores ✒️
* **[Juan Andres Toro]** - *Trabajo Inicial* - [Juanelc4734k]
* **[Yenifer Tamayo Villa]** - *Trabajo Inicial* - [Yeniiiiii]
* **[Mariana Andres Nisperuza]** - *Trabajo Inicial* - [Mariana Nisperuza]

## Agradecimientos 🎁
* Comenta a otros sobre este proyecto 📢
```
Aquí tienes el README.md actualizado según la estructura y contenido del manual de instalación que proporcionaste:

---

# 🫧 BubbleBox - Red Social

BubbleBox es una red social que busca optimizar la interacción entre usuarios, permitiendo una experiencia fluida con múltiples funcionalidades como publicaciones, comunidades, mensajería y más.

---

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React.js**: Construcción de interfaces de usuario interactivas.
- **Vite**: Herramienta de desarrollo rápida y ligera.

### **Backend**
- **Node.js**: Entorno de ejecución en el servidor.
- **Express.js**: Framework para la gestión de API REST.

### **Base de Datos**
- **MySQL**: Sistema de gestión de bases de datos relacional.

---

## 📋 Requisitos Previos

Antes de comenzar la instalación, asegúrate de cumplir con los siguientes requisitos:

- **Node.js** (versión LTS)
- **Git** (para clonar el repositorio)
- **MySQL** (v8 o superior) - Base de datos utilizada por la aplicación.
- **Postman** (Opcional, para pruebas de API)
- **Visual Studio Code** (o cualquier otro editor de código)

---

## 🖥️ Requisitos del Sistema

### **Hardware Requerido**
| Recurso     | Mínimo                  | Recomendado |
|-------------|-------------------------|-------------|
| **Procesador** | Intel Core i3 / AMD Ryzen 3 | Intel Core i5 o superior |
| **Memoria RAM** | 3 GB | 8 GB o más |
| **Espacio en Disco** | 5 GB libres | 10 GB libres |
| **Conexión a Internet** | Requerida para instalación | Banda ancha recomendada |

### **Software Requerido**
#### **Windows**
- Node.js (versión LTS)
- Git
- Postman
- Visual Studio Code
- MySQL Server o WAMP64

#### **Linux**
- Node.js (usar `nvm`)
- Git
- MySQL Server
- Postman
- Visual Studio Code

---

## 🚀 Instalación

### **1️⃣ Instalación en Windows**
1. **Instalar Node.js** desde [aquí](https://nodejs.org/)
2. **Instalar Git** desde [aquí](https://git-scm.com/downloads)
3. **Instalar Visual Studio Code** desde [aquí](https://code.visualstudio.com/)
4. **Instalar MySQL** desde [aquí](https://dev.mysql.com/downloads/workbench/) o **WAMP64** desde [aquí](https://www.wampserver.com/)

### **2️⃣ Instalación en Linux**
Ejecuta los siguientes comandos:

```bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# Instalar Git
sudo apt install git -y

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar Postman
sudo snap install postman

# Instalar Visual Studio Code
sudo snap install code --classic
```

---

## 📂 Clonación del Proyecto

### **1️⃣ Generar clave SSH (Opcional)**
Si deseas clonar el proyecto con SSH, ejecuta:

```bash
ssh-keygen -t rsa -b 4096 -C "tu-correo@example.com"
```

Luego, añade la clave en **GitHub**: `Settings > SSH and GPG keys`.

### **2️⃣ Clonar el repositorio**
```bash
git clone https://github.com/Juanelc4734k/BubbleBox.git
cd BubbleBox
```

---

## 🗄️ Configuración de la Base de Datos

### **1️⃣ Importar Base de Datos en MySQL**
#### **Opción 1: Usando MySQL Workbench**
1. Abre MySQL Workbench.
2. Selecciona **File > Open SQL Script** y elige el archivo SQL de la base de datos.
3. Ejecuta el script.

#### **Opción 2: Usando phpMyAdmin**
1. Abre **WAMP/XAMPP** y accede a `localhost/phpmyadmin`.
2. Crea una base de datos con el nombre `bubblebox_db`.
3. Ve a la pestaña **Importar** y selecciona el archivo SQL.

#### **Opción 3: Desde la Terminal en Linux**
```bash
mysql -u root -p bubblebox_db < dump.sql
```

---

## ⚙️ Instalación y Ejecución del Proyecto

### **1️⃣ Configurar variables de entorno**
```bash
cd backend/
cp .env.example .env
nano .env  # Configurar credenciales de MySQL y otros servicios
```

### **2️⃣ Instalar dependencias**
```bash
# Instalar dependencias del backend
cd backend/
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### **3️⃣ Ejecutar el proyecto**
#### **Levantar el backend**
```bash
cd backend/scripts
nodemon startAllServices.js
```

#### **Levantar el frontend**
```bash
cd frontend
npm run dev
```

Ahora, la aplicación estará disponible en **http://localhost:5173**.

---

## 🚀 Despliegue en Producción

### **1️⃣ Configuración en un Servidor**
BubbleBox puede ser desplegado en plataformas como **Heroku, Vercel, DigitalOcean, AWS, etc.**.

#### **Backend en Heroku**
```bash
heroku login
heroku create bubblebox-api
git push heroku main
heroku config:set DATABASE_URL="mysql://usuario:contraseña@host:puerto/bubblebox_db"
heroku ps:scale web=1
```

#### **Frontend en Vercel**
```bash
npm install -g vercel
vercel login
vercel deploy
```

#### **Configuración en Apache/Nginx**
Para entornos auto-administrados, es recomendable configurar un proxy reverso con **Nginx**.

---

## 🛠️ Resolución de Problemas

### **Errores comunes y soluciones**
| Error | Solución |
|-------------|----------------|
| `Error: Cannot find module 'express'` | Ejecuta `npm install` en el directorio correcto. |
| `MySQL connection refused` | Verifica que MySQL esté corriendo y las credenciales sean correctas. |
| `Frontend no carga datos` | Asegúrate de que el backend está ejecutándose correctamente en el puerto esperado. |

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.

---

## 👨‍💻 Autores

- **Juan Andres Toro Blandon** - Desarrollador Backend
- **Yenifer Tamayo Villa** - Desarrolladora Frontend
- **Mariana Andrea Nisperuza Puerta** - Base de Datos y Arquitectura

---

### 🎁 Agradecimientos

A la comunidad Open Source y a todos los que han contribuido a mejorar este proyecto. 🙌

---

Con esta versión mejorada del README.md, tienes un documento alineado con el manual de instalación, con instrucciones más estructuradas y optimizadas para usuarios de Windows y Linux. 🚀

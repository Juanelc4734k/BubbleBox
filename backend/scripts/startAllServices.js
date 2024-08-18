const { spawn } = require('child_process');
const path = require('path');

const servicios = [
    { nombre: 'auth', ruta: '../services/auth/index.js', puerto: 3010 },
    { nombre: 'chats', ruta: '../services/chats/index.js', puerto: 3001 },
    { nombre: 'users', ruta: '../services/users/index.js', puerto: 3009 },
    { nombre: 'posts', ruta: '../services/posts/index.js', puerto: 3008 }
];

servicios.forEach(servicio => {
    const proceso = spawn('node', [path.resolve(__dirname, servicio.ruta)], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, NODE_ENV: 'development' }
    });

    proceso.on('error', (error) => {
        console.error(`Error al iniciar ${servicio.nombre}:`, error);
    });

    proceso.on('close', (code) => {
        console.log(`${servicio.nombre} finalizado con código ${code}`);
    });

    console.log(`El servicio ${servicio.nombre} está corriendo en el puerto ${servicio.puerto}`);
    console.log('Directorio actual:', process.cwd());
    console.log('Contenido del directorio:', require('fs').readdirSync(process.cwd()));
});

console.log('Todos los microservicios han sido iniciados.');
const { spawn } = require('child_process');
const path = require('path');

const colores = {
    reset: "\x1b[0m",
    rojo: "\x1b[31m",
    verde: "\x1b[32m",
    amarillo: "\x1b[33m",
    azul: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

const gateway = { nombre: 'gateway', ruta: '../gateway/src/tests/index.js', puerto: 3000 };

const servicios = [
    { nombre: 'chats', ruta: '../services/chats/index.js', puerto: 3001 },
    { nombre: 'reels', ruta: '../services/reels/index.js', puerto: 3002 },
    { nombre: 'stories', ruta: '../services/stories/index.js', puerto: 3003 },
    { nombre: 'communities', ruta: '../services/communities/index.js', puerto: 3004 },
    { nombre: 'friendships', ruta: '../services/friendships/index.js', puerto: 3005 },
    { nombre: 'notifications', ruta: '../services/notifications/index.js', puerto: 3007 },
    { nombre: 'posts', ruta: '../services/posts/index.js', puerto: 3008 },
    { nombre: 'users', ruta: '../services/users/index.js', puerto: 3009 },
    { nombre: 'auth', ruta: '../services/auth/index.js', puerto: 3010 },
    { nombre: 'comments', ruta: '../services/comments/index.js', puerto: 3011 },
    { nombre: 'reactions', ruta: '../services/reactions/index.js', puerto: 3012 },
];

const tiempoInicio = Date.now();

const iniciarServicio = (servicio) => {
    const tiempoInicioServicio = Date.now();
    
    const proceso = spawn('node', [path.resolve(__dirname, servicio.ruta)], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        env: { ...process.env, NODE_ENV: 'development' }
    });

    proceso.stdout.on('data', (data) => {
        process.stdout.write(`${colores.magenta}[${servicio.nombre}] ${data.toString().trim()}\n`);
    });

    proceso.stderr.on('data', (data) => {
        process.stderr.write(`${colores.rojo}[${servicio.nombre}] Error: ${data.toString().trim()}\n`);
    });

    proceso.on('error', (error) => {
        console.error(`${colores.rojo}Error al iniciar ${servicio.nombre} (${Date.now() - tiempoInicioServicio}ms):`, error);
    });

    proceso.on('close', (code) => {
         - tiempoInicioServicio}ms)`);
    });

     - tiempoInicioServicio}ms)`);
};


iniciarServicio(gateway);

setTimeout(() => {
    
    servicios.forEach(iniciarServicio);
     - tiempoInicio}ms`);
}, 5000);


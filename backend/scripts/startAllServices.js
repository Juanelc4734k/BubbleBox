const { exec } = require('child_process');

const servicios = [
    { nombre: 'chats', ruta: '../services/chats/index.js' },
    { nombre: 'communities', ruta: '../services/communities/index.js' },
    { nombre: 'auth', ruta: '../services/auth/index.js' }
];

servicios.forEach(servicio => {
    const proceso = exec(`node ${servicio.ruta}`,
        (error, stdout, stderr) => {
            if(error) {
                console.error(`Error al iniciar ${servicio.nombre}: `, error);
                return;
            }
            if(stderr) {
                console.error(`stderr de ${servicio.nombre}: `, stderr);
                return;
            }
            console.error(`stdout de ${servicio.nombre}: `, stdout);
        });

        proceso.on('close', code => {
            console.log(`${servicio.nombre} finalizado con codigo ${code}`);
        });
});

console.log('Todos los microservicios han sido iniciados. ')
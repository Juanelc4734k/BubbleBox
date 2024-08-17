const { exec } = require('child_process');

const servicios = [
    { nombre: 'auth', ruta: '../auth/index.js', puerto: 3010 },
    { nombre: 'chats', ruta: '../chats/index.js', puerto: 3001 }
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
        console.log(`${servicio.nombre} finalizado con código ${code}`);
    });

    console.log(`El servicio ${servicio.nombre} está corriendo en el puerto ${servicio.puerto}`);
});

console.log('Todos los microservicios han sido iniciados.')
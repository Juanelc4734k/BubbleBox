const reactionsModel = require('../models/reactionsModel');
const axios = require('axios');

const crearReaccion = async (req, res) => {
  console.log('Iniciando crearReaccion');
  try {
    const { id_usuario, id_contenido, tipo_contenido, tipo } = req.body;
    console.log('Datos recibidos:', { id_usuario, id_contenido, tipo_contenido, tipo });

    let idAutor;
    try {
      console.log('Obteniendo información del contenido');
      const infoContenido = await reactionsModel.obtenerInformacionContenido(id_contenido, tipo_contenido);
      idAutor = infoContenido.id_usuario;
      console.log('ID del autor del contenido:', idAutor);
    } catch (error) {
      console.error('Error al obtener información del contenido:', error.message);
      return res.status(404).json({ mensaje: 'Contenido no encontrado', error: error.message });
    }

    // Crear la reacción
    console.log('Creando la reacción');
    const resultado = await reactionsModel.crearReaccion(req.body);
    console.log('Reacción creada con éxito');

    // Enviar notificación solo si el autor es diferente al usuario que reacciona
    if (idAutor && idAutor !== id_usuario) {
      console.log('El autor del contenido es diferente al usuario que reacciona');
      let nombreUsuario = 'Usuario';
      try {
        console.log('Obteniendo nombre del usuario');
        const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${id_usuario}`);
        nombreUsuario = respuestaUsuario.data.nombre;
        console.log('Nombre del usuario obtenido:', nombreUsuario);
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error.message);
      }

      console.log('Intentando enviar notificación');
      try {
        const respuestaNotificacion = await axios.post(`http://localhost:3000/notifications/send`, {
          usuario_id: idAutor,
          tipo: 'reaccion',
          contenido: `A ${nombreUsuario} le ha gustado tu ${tipo_contenido}`
        });
        
        console.log('Respuesta de la notificación:', respuestaNotificacion.data);
        
        if (respuestaNotificacion.status !== 201) {
          throw new Error(`Error al crear la notificación: ${JSON.stringify(respuestaNotificacion.data)}`);
        }
      } catch (error) {
        console.error('Error al enviar la notificación:', error.message);
        console.error('Detalles del error:', error.response ? error.response.data : 'No hay datos de respuesta');
      }
    } else {
      console.log('El autor del contenido es el mismo que el usuario que reacciona o no se encontró el autor');
    }

    res.status(201).json({ mensaje: 'Reacción creada con éxito', resultado });
  } catch (error) {
    console.error('Error en crearReaccion:', error);
    res.status(500).json({ mensaje: 'Error al crear la reacción', error: error.message });
  }
};

const obtenerReaccionesPublicacion = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesPublicacion(req.params.id_publicacion);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones de la publicación', error: error.message });
  }
};

const obtenerReaccionesReel = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesReel(req.params.id_reel);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones del reel', error: error.message });
  }
};

const obtenerReaccionesHistoria = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesHistoria(req.params.id_historia);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones de la historia', error: error.message });
  }
};

const eliminarReaccion = async (req, res) => {
  try {
    const { id_usuario, id_contenido, tipo_contenido } = req.body;
    await reactionsModel.eliminarReaccion(id_usuario, id_contenido, tipo_contenido);
    res.status(200).json({ mensaje: 'Reacción eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la reacción', error: error.message });
  }
};

const actualizarReaccion = async (req, res) => {
  try {
    const resultado = await reactionsModel.actualizarReaccion(req.body);
    res.status(200).json({ mensaje: 'Reacción actualizada con éxito', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la reacción', error: error.message });
  }
};

module.exports = {
  crearReaccion,
  obtenerReaccionesPublicacion,
  obtenerReaccionesReel,
  obtenerReaccionesHistoria,
  eliminarReaccion,
  actualizarReaccion
};

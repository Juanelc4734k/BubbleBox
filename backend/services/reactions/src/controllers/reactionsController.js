const reactionsModel = require('../models/reactionsModel');
const axios = require('axios');

const crearReaccion = async (req, res) => {
  
  try {
    const { id_usuario, id_contenido, tipo_contenido, tipo } = req.body;
    

    let idAutor;
    try {
      
      const infoContenido = await reactionsModel.obtenerInformacionContenido(id_contenido, tipo_contenido);
      idAutor = infoContenido.id_usuario;
      
    } catch (error) {
      console.error('Error al obtener información del contenido:', error.message);
      return res.status(404).json({ mensaje: 'Contenido no encontrado', error: error.message });
    }

    // Convert IDs to numbers for proper comparison
    const autorId = Number(idAutor);
    const usuarioId = Number(id_usuario);

    // Crear la reacción
    
    const resultado = await reactionsModel.crearReaccion(req.body);
    

    // Enviar notificación solo si el autor es diferente al usuario que reacciona
    if (autorId && usuarioId && autorId !== usuarioId) {
      
      let nombreUsuario = 'Usuario';
      try {
        
        const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${id_usuario}`);
        nombreUsuario = respuestaUsuario.data.nombre;
        
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error.message);
      }

      
      try {
        const respuestaNotificacion = await axios.post(`http://localhost:3000/notifications/send`, {
          usuario_id: idAutor,
          tipo: 'reaccion',
          contenido: `A ${nombreUsuario} le ha gustado tu ${tipo_contenido}`
        });
        
        
        
        if (respuestaNotificacion.status !== 201) {
          throw new Error(`Error al crear la notificación: ${JSON.stringify(respuestaNotificacion.data)}`);
        }
      } catch (error) {
        console.error('Error al enviar la notificación:', error.message);
        console.error('Detalles del error:', error.response ? error.response.data : 'No hay datos de respuesta');
      }
    } else {
      
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

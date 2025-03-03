const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const usuarios = await userModel.getAllUsers();
    const usuariosConRol = usuarios.map(usuario => ({
      ...usuario,
      rol: usuario.rol || 'usuario'
    }));
    res.json(usuariosConRol);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const usuario = await userModel.getUserById(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, username, email, contraseña, avatar, estado } = req.body;

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    const userId = await userModel.createUser({
      nombre,
      username,
      email,
      contraseña: hashedPassword,
      avatar,
      estado
    });

    res.status(201).json({ mensaje: "Usuario creado con éxito", userId });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: "Error al crear usuario", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.params.id, req.body);
    
    // Validate that we have an ID and data
    if (!req.params.id) {
      return res.status(400).json({ mensaje: 'ID de usuario requerido' });
    }

    // Explicitly extract the fields we want to update
    const updateData = {
      nombre: req.body.nombre,
      username: req.body.username,
      email: req.body.email,
      descripcion_usuario: req.body.descripcion_usuario,
      estado: req.body.estado
    };

    console.log('Datos a actualizar:', updateData);

    const actualizado = await userModel.updateUser(req.params.id, updateData);
    
    if (actualizado) {
      // Get updated user data to confirm changes
      const usuarioActualizado = await userModel.getUserById(req.params.id);
      res.json({ 
        mensaje: 'Usuario actualizado',
        usuario: usuarioActualizado
      });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const eliminado = await userModel.deleteUser(req.params.id);
    if (eliminado) {
      res.json({ mensaje: 'Usuario eliminado' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const usuarios = await userModel.searchUsers(req.params.query);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar usuarios', error: error.message });
  }
};

const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const avatarUrl = req.file ? req.file.filename : null;
        
        if (!avatarUrl && !req.body.avatarUrl) {
            return res.status(400).json({ 
                mensaje: "Se requiere una imagen para actualizar el perfil" 
            });
        }

        const updated = await userModel.updateAvatar(
            userId, 
            avatarUrl ? `/uploads/${avatarUrl}` : req.body.avatarUrl
        );

        if (!updated) {
            return res.status(404).json({ 
                mensaje: "No se pudo actualizar la foto de perfil" 
            });
        }

        res.json({ 
            mensaje: "Foto de perfil actualizada con éxito",
            avatarUrl: avatarUrl ? `/uploads/${avatarUrl}` : req.body.avatarUrl
        });
    } catch (error) {
        console.error('Error al actualizar la foto de perfil:', error);
        res.status(500).json({ 
            mensaje: "Error al actualizar la foto de perfil",
            error: error.message 
        });
    }
};
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  }

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ mensaje: "Se requieren la contraseña actual y la nueva contraseña" });
    }

    // Obtener el usuario de la base de datos
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (!user.contraseña) {
      return res.status(400).json({ mensaje: "Error en los datos del usuario. Contacte al administrador." });
    }

    let isMatch;
    if (user.contraseña.startsWith('$2b$') || user.contraseña.startsWith('$2a$')) {
      // La contraseña parece estar hasheada, usa bcrypt.compare
      isMatch = await bcrypt.compare(currentPassword, user.contraseña);
    } else {
      // La contraseña no está hasheada, compara directamente
      isMatch = currentPassword === user.contraseña;
      
      // Opcional: Hashear la contraseña existente para futuras comparaciones
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashedExistingPassword = await bcrypt.hash(currentPassword, salt);
        await userModel.changePassword(userId, hashedExistingPassword);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ mensaje: "La contraseña actual es incorrecta" });
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña en la base de datos
    await userModel.changePassword(userId, hashedPassword);

    res.json({ mensaje: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cambiar la contraseña", error: error.message });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const userId = req.user.id;

    const userProfile = await userModel.getUserById(userId);

    if (!userProfile) {
      return res.status(404).json({ mensaje: "Perfil de usuario no encontrado" });
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil del usuario", error: error.message });
  }
};

// Añadir esta nueva función al final del archivo, antes de module.exports
const getPublicUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const userProfile = await userModel.getUserById(userId);

    if (!userProfile) {
      return res.status(404).json({ mensaje: "Perfil de usuario no encontrado" });
    }

    // Filtrar información sensible
    const publicProfile = {
      id: userProfile.id,
      nombre: userProfile.nombre,
      username: userProfile.username,
      descripcion_usuario: userProfile.descripcion_usuario,
      email: userProfile.email,
      avatar: userProfile.avatar,
      estado: userProfile.estado
    };

    res.json(publicProfile);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil del usuario", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  updateProfilePhoto,
  changePassword,
  getCurrentUserProfile,
  getPublicUserProfile
};
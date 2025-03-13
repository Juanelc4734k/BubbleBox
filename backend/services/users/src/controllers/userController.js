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

const suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const estado = req.body.estado;
    // Validate that we have an ID and a valid state
    if (!userId || (estado !== 'conectado' && estado !== 'suspendido')) {
      return res.status(400).json({ mensaje: 'ID de usuario y estado válidos requeridos' });
    }
    const actualizado = await userModel.suspendUser(userId, estado);
    if (actualizado) {
      res.json({ mensaje: 'Estado del usuario actualizado' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender usuario', error: error.message });
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
    
    if (!req.params.id) {
      return res.status(400).json({ mensaje: 'ID de usuario requerido' });
    }

    // Get current user data
    const currentUser = await userModel.getUserById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Maintain existing values if not provided in request
    const updateData = {
      nombre: req.body.nombre !== undefined ? req.body.nombre : currentUser.nombre,
      username: req.body.username !== undefined ? req.body.username : currentUser.username,
      email: req.body.email !== undefined ? req.body.email : currentUser.email,
      descripcion_usuario: req.body.descripcion_usuario !== undefined ? req.body.descripcion_usuario : currentUser.descripcion_usuario,
      estado: req.body.estado !== undefined ? req.body.estado : currentUser.estado
    };

    if(req.body.intereses && Array.isArray(req.body.intereses)) {
      const intereses = req.body.intereses;
      await userModel.addUserInterests(req.params.id, intereses);
    }

    console.log('Datos a actualizar:', updateData);

    const actualizado = await userModel.updateUser(req.params.id, updateData);
    
    if (actualizado) {
      const usuarioActualizado = await userModel.getUserById(req.params.id);
      const interes = await userModel.getUserInterests(req.params.id);
      res.json({ 
        mensaje: 'Usuario actualizado',
        usuario: {
          ...usuarioActualizado,
          interes
        }
      });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

const getUserInterests = async (req, res) => {
  try {
    const userId = req.params.id;
    const intereses = await userModel.getUserInterests(userId);
    res.json(intereses);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener intereses', error: error.message });
  }
};

const updateUserInterests = async (req, res) => {
  try {
    const userId = req.params.id;
    const intereses = req.body.intereses;

    if (!userId || !intereses || !Array.isArray(intereses)) {
      return res.status(400).json({ mensaje: 'ID de usuario y intereses válidos requeridos' });
    }
    await userModel.addUserInterests(userId, intereses);
    res.json({ mensaje: 'Intereses actualizados' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar intereses', error: error.message });
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
    const intereses = await userModel.getUserInterests(userId);
    const userSettings = await userModel.getUserSettings(userId);

    if (!userProfile) {
      return res.status(404).json({ mensaje: "Perfil de usuario no encontrado" });
    }

    res.json({
      ...userProfile,
      privacidad: userSettings.privacidad,
      intereses
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil del usuario", error: error.message });
  }
};


const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth token
    const { privacidad } = req.body;
    
    if (!privacidad) {
      return res.status(400).json({ mensaje: 'Se requiere el campo privacidad' });
    }
    
    await userModel.updatePrivacySettings(userId, privacidad);
    
    res.json({ mensaje: 'Configuración de privacidad actualizada con éxito' });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ mensaje: 'Error al actualizar configuración de privacidad', error: error.message });
  }
};

// Añadir esta nueva función al final del archivo, antes de module.exports
const getPublicUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.user ? req.user.id : null;

    const userProfile = await userModel.getUserById(userId);
    const intereses = await userModel.getUserInterests(userId);
    const userSettings = await userModel.getUserSettings(userId);

    if (!userProfile) {
      return res.status(404).json({ mensaje: "Perfil de usuario no encontrado" });
    }

    // Verificar si el perfil es público
    if (userSettings.privacidad === 'amigos' && userId !== requesterId) {
      const areFriends = await userModel.checkFriendship(userId, requesterId);
      if (!areFriends) {
        return res.status(403).json({ mensaje: "Este perfil solo es visible para amigos" });
      }
    }

    // Filtrar información sensible
    const publicProfile = {
      id: userProfile.id,
      nombre: userProfile.nombre,
      username: userProfile.username,
      descripcion_usuario: userProfile.descripcion_usuario,
      email: userProfile.email,
      avatar: userProfile.avatar,
      estado: userProfile.estado,
      privacidad: userSettings.privacidad,
      intereses: intereses
    };

    res.json(publicProfile);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil del usuario", error: error.message });
  }
};

const getUserSettings = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    const settings = await userModel.getUserSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ mensaje: 'Error al obtener configuraciones de usuario', error: error.message });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    const settings = req.body;
    
    await userModel.updateUserSettings(userId, settings);
    
    // Get updated settings to return to client
    const updatedSettings = await userModel.getUserSettings(userId);
    
    res.json({ 
      mensaje: 'Configuraciones actualizadas con éxito',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ mensaje: 'Error al actualizar configuraciones de usuario', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ mensaje: 'Se requiere el campo estado' });
    }
    await userModel.updateUserStatus(userId, estado);
    res.json({ mensaje: 'Estado actualizado con éxito' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estado de usuario', error: error.message });
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
  updatePrivacySettings,
  getUserSettings,
  updateUserSettings,
  updateUserStatus,
  getPublicUserProfile,
  updateUserInterests,
  getUserInterests,
  suspendUser
};
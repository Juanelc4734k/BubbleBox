const groupChatModel = require('../models/groupChatModel');

const createGroup = async (req, res) => {
    try {
        const { name, descripcion, userId } = req.body;
        const imagen = req.file ? req.file.filename : null;
        
        
        const group = await groupChatModel.createGroup(userId, name, descripcion, imagen);
        await groupChatModel.addUserToGroup(userId, group.id);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
    }
};

const createGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { senderId, message } = req.body;
        const saved = await groupChatModel.saveGroupMessageWithTimestamp(senderId, groupId, message);
        if (saved) {
            res.json({ message: 'Mensaje enviado exitosamente' });
        } else {
            res.status(400).json({ message: 'No se pudo enviar el mensaje' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el mensaje', error: error.message });
    }
}

const addMember = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        // Changed order of parameters to match model's expected order (groupId, userId)
        const added = await groupChatModel.addUserToGroup(groupId, userId);
        if (added) {
            res.json({ message: 'Usuario agregado al grupo exitosamente' });
        } else {
            res.status(400).json({ message: 'No se pudo agregar el usuario al grupo' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar usuario al grupo', error: error.message });
    }
};

const getGroups = async (req, res) => {
    try {
        const { userId } = req.params;
        const groups = await groupChatModel.getGroups(userId);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener grupos', error: error.message });
    }
};

const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await groupChatModel.getGroup(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener grupo', error: error.message });
    }
};

const getGroupMessages = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
         // Debug log
        
        const isMember = await groupChatModel.isMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({ message: 'No eres miembro de este grupo' });
        }

        const messages = await groupChatModel.getGroupMessages(groupId);
        res.json(messages);
    } catch (error) {
        console.error('Error in getGroupMessages:', error); // Debug log
        res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
    }
};

const getGroupUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const users = await groupChatModel.getUsersByGroup(groupId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios del grupo', error: error.message });
    }
};

module.exports = {
    createGroup,
    createGroupMessage,
    addMember,
    getGroups,
    getGroup,
    getGroupMessages,
    getGroupUsers
};
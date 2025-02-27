const groupChatModel = require('../models/groupChatModel');

const createGroup = async (req, res) => {
    try {
        const { name, imagen, userId } = req.body;
        const group = await groupChatModel.createGroup(name, imagen);
        await groupChatModel.addUserToGroup(userId, group.id);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        const added = await groupChatModel.addUserToGroup(userId, groupId);
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

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.query;
        
        const isMember = await groupChatModel.isMember(userId, groupId);
        if (!isMember) {
            return res.status(403).json({ message: 'No eres miembro de este grupo' });
        }

        const messages = await groupChatModel.getGroupMessages(groupId);
        res.json(messages);
    } catch (error) {
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
    addMember,
    getGroups,
    getGroupMessages,
    getGroupUsers
};
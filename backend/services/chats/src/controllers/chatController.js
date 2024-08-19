const chatModel = require('../models/chatsModel');
const friendshipModel = require('../../../friendships/src/models/friendModel');

const getMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const areFriends = await friendshipModel.checkFriendship(userId1, userId2);
        if (!areFriends) {
            return res.status(403).json({ message: 'No puedes ver mensajes de usuarios que no son tus amigos' });
        }
        const messages = await chatModel.getMessages(userId1, userId2);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los mensajes', error: error.message });
    }
};

const createMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        const areFriends = await friendshipModel.checkFriendship(senderId, receiverId);
        if (!areFriends) {
            return res.status(403).json({ message: 'No puedes enviar mensajes a usuarios que no son tus amigos' });
        }
        const newMessage = await chatModel.saveMessage(senderId, receiverId, message);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el mensaje', error: error.message });
    }
};

const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const updatedMessage = await chatModel.updateMessage(messageId, message);
        if (updatedMessage) {
            res.json(updatedMessage);
        } else {
            res.status(404).json({ message: 'Mensaje no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el mensaje', error: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const deleted = await chatModel.deleteMessage(messageId);
        if (deleted) {
            res.json({ message: 'Mensaje eliminado con éxito' });
        } else {
            res.status(404).json({ message: 'Mensaje no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el mensaje', error: error.message });
    }
};

module.exports = {
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage
};
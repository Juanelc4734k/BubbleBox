const chatModel = require('../models/chatsModel');
const friendshipModel = require('../../../friendships/src/models/friendModel');
const axios = require('axios');

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
            return res.status(403).json({ mensaje: 'No puedes enviar mensajes a usuarios que no son tus amigos' });
        }
        
        let nombreRemitente = 'Usuario';
        try {
            const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${senderId}`);
            nombreRemitente = respuestaUsuario.data.nombre;
        } catch (error) {
            console.error('Error al obtener el nombre del remitente:', error.message);
        }
        
        const nuevoMensaje = await chatModel.saveMessage(senderId, receiverId, message);
        try {
            await axios.post(`http://localhost:3000/notifications/send`, {
                usuario_id: receiverId,
                tipo: 'message',
                contenido: `Tu amigo ${nombreRemitente} te ha enviado un mensaje`
            });
        } catch (error) {
            console.error('Error al enviar la notificación:', error.message);
        }
        res.status(201).json(nuevoMensaje);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el mensaje', error: error.message });
    }
};


const createFileMessage = async (req, res) => {
    try {
        const { senderId, receiverId, temp_id } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        
        // Get the file path
        const fileType = req.file.mimetype.split('/')[0]; // 'image', 'application', etc.
        let filePath;
        
        if (fileType === 'image') {
            filePath = `/uploads/images/${req.file.filename}`;
        } else {
            filePath = `/uploads/documents/pdf/${req.file.filename}`;
        }
        
        

        const existingMessage = await chatModel.getFileMessageByPath(filePath);

        if(existingMessage) {
            
            return res.status(200).json({
                messageId: existingMessage.id,
                filePath: existingMessage.file_path,
                fileType: existingMessage.file_type,
                fileName: existingMessage.file_name,
                temp_id
            });
        }

        const messageData = {
            sender_id: senderId,
            receiver_id: receiverId,
            file_path: filePath,
            file_type: fileType,
            file_name: req.file.originalname
        };

        const savedMessage = await chatModel.saveFileMessage(messageData);
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('send_file_message', {
                senderId,
                receiverId,
                filePath,
                fileType,
                fileName: req.file.originalname,
                temp_id,
                id: savedMessage.id
            });
            
        } else {
            console.warn('Socket.io instance not available');
        }
        
        // Return success response
        res.status(200).json({ 
            success: true, 
            filePath,
            fileType,
            fileName: req.file.originalname,
            message: 'File message received and processing'
        });
    } catch (error) {
        console.error('Error in createFileMessage:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const createAudioMessage = async (req, res) => {
    try {
        const { senderId, receiverId, temp_id, duration } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        
        // Get the file path
        const audioPath = `/uploads/audios/${req.file.filename}`;
        

        const existingMessage = await chatModel.getAudioMessageByPath(audioPath);

        if(existingMessage) {
            
            return res.status(200).json({
                messageId: existingMessage.id,
                filePath: existingMessage.audio_path,
                temp_id
            });
        }

        const messageData = {
            sender_id: senderId,
            receiver_id: receiverId,
            audio_path: audioPath,
            duration: duration || '0:00'
        };

        const savedMessage = await chatModel.saveAudioMessage(messageData);
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('send_audio_message', {
                senderId,
                receiverId,
                audioPath,
                duration: duration || '0:00',
                temp_id,
                id: savedMessage.id
            });
            
        } else {
            console.warn('Socket.io instance not available');
        }
        
        // Return success response
        res.status(200).json({ 
            success: true, 
            audioPath,
            message: 'Audio message received and processing'
        });
    } catch (error) {
        console.error('Error in createAudioMessage:', error);
        res.status(500).json({ error: 'Server error' });
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

const updateLastSeen = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, lastSeen } = req.body;

        const updated = await chatModel.updateLastSeen(userId, status || 'conectado', lastSeen);

        if (updated) {
            res.json({ success: true, message: 'Last seen updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating last seen:', error);
        res.status(500).json({ success: false, message: 'Error updating last seen' });
    }
}

const getUnreadCount = async (req, res) => {
    try {
      const { userId, friendId } = req.params;
      const count = await chatModel.getUnreadCount(userId, friendId);
      res.json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: 'Error getting unread count', error: error.message });
    }
  };

  const markMessagesAsRead = async (req, res) => {
    try {
      const { userId, friendId } = req.params;
      await chatModel.markMessagesAsRead(userId, friendId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
  };

module.exports = {
    getMessages,
    createMessage,
    createFileMessage,
    updateMessage,
    deleteMessage,
    updateLastSeen,
    createAudioMessage,
    getUnreadCount,
    markMessagesAsRead
};
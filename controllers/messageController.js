import Message from '../models/messageModel.js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, content } = req.body

        // Vérifier que tous les champs sont présents
        if (!sender || !receiver || !content) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }
        
        // Créer le message
        const newMessage = await Message.create({ sender, receiver, content });

        const messagesFormatted = {
              _id: newMessage._id,
              sender: newMessage.sender,
              receiver: newMessage.receiver,
              content: newMessage.content,
              createdAt: format( newMessage.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })
        };

        res.status(201).json({ message: "Message créé avec succès", newMessage : messagesFormatted })
    } catch (error) {
        console.error("Erreur lors de la création :", error)
        res.status(500).json({ message: "Erreur serveur" })
    }
}

export const receivedMessage = async (req, res) => {
       try {
          const { userId } = req.params;

           // Lire les query params (page & limit) → avec valeurs par défaut
           const page = parseInt(req.query.page) || 1;
           const limit = parseInt(req.query.limit) || 10;

          const messagesReceived = await Message.find({ receiver : userId })
          .populate("sender", "pseudo email")
          .populate("receiver", "pseudo email")
          .sort({ createdAt: -1 }) // + récent → + ancien
          .skip((page - 1) * limit) // Scroll infini
          .limit(limit); 

          if (!messagesReceived.length) {
            return res.status(404).json({ message: "Aucun message reçu pour cet utilisateur"})
          }

          const messagesFormatted = messagesReceived.map(msg => ({
               _id: msg._id,
               sender: msg.sender,
               receiver: msg.receiver,
               content: msg.content,
               createdAt: format(msg.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })
          }));

          

          res.status(200).json({ 
            message: `Page ${page} - ${messagesFormatted.length} messages récupérés avec succès`,
            page,
            limit, 
            messagesReceived: messagesFormatted })

       } catch (error) {
        console.error("Erreur dans receivedMessage :", error)
         res.status(500).json({ message: "Erreur lors de la récupération des messages", error });
       }
}

export const getMessagesBetweenUsers = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 } 
            ]
        })
        .sort({ createdAt: 1 });

        const messagesFormatted = messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender,
            receiver: msg.receiver,
            content: msg.content,
            createdAt: format(msg.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })
        }));

        res.status(200).json({ message: "Messages récupérés avec succès", 
                               messages: messagesFormatted
                            });
    } catch (error) {
        console.error("Erreur récupération messages", error)
        res.status(500).json({ message: "Erreur serveur", error })
    }
}


export const getMessagesCountByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const messagesCount = await Message.countDocuments({ sender: userId })

        res.status(200).json({
            message: "Nombre de messages envoyés récupérés avec succès",
            userId,
            messagesCount
        });

    } catch (error) {
        console.error("Erreur récupération nombres de messages", error)
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error})
    }
}

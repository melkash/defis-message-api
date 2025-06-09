import express from "express";
import { sendMessage,
         receivedMessage,
         getMessagesBetweenUsers,
         getMessagesCountByUser
} from "../controllers/messageController.js"
import { protect, isAdmin } from "../middlewares/authMiddlewares.js"



const router = express.Router()

// Routes
router.post('/send', protect, sendMessage);
router.get('/:userId', protect, receivedMessage);
router.get('/conversation/:userId1/:userId2', protect, getMessagesBetweenUsers);
router.get('/messagesCount/:userId', protect, getMessagesCountByUser);



export default router
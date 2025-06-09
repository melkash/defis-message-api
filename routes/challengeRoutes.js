import express from "express";
import { createChallenge,
         getAllChallenge,
         getChallengeById,
         searchChallenges,
         updateChallenge,
         deleteChallenge
} from "../controllers/challengeController.js"; 
import { protect, isAdmin } from "../middlewares/authMiddlewares.js";


const router = express.Router();

// Routes
router.post('/', protect, isAdmin, createChallenge);
router.get('/', protect, getAllChallenge);
router.get('/search', protect, searchChallenges);
router.get('/:id', protect, getChallengeById);
router.put('/:id', protect, isAdmin, updateChallenge);
router.delete('/:id', protect, isAdmin, deleteChallenge)



export default router;


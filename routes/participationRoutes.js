import express from "express";
import { createParticipation,
         getParticipationRanking,
         getTopParticipantsByChallenge,
         getParticipationByChallenge,
         getParticipationByUser
 } from "../controllers/participationController.js";
 import { protect, isAdmin } from '../middlewares/authMiddlewares.js'

const router = express.Router();

// Route
router.post("/", protect, createParticipation);
router.get("/ranking", protect, isAdmin, getParticipationRanking);
router.get('/challenge/:challengeId/top', protect, isAdmin, getTopParticipantsByChallenge);
router.get('/challenge/:challengeId', protect, isAdmin, getParticipationByChallenge);
router.get('/user/:userId', protect, getParticipationByUser);



export default router;
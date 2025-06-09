import Participation from "../models/participationModel.js";
import mongoose from "mongoose";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const createParticipation = async (req, res) => {
    try {
        const { user, challenge } = req.body;

        if (!user || !challenge) {
            return res.status(400).json({ message: "Tous les champs sont obligatoire" });
        }

        const newParticipation = await Participation.create({ user, challenge })
        
        // Récupération enrichie

        const populatedParticipation = await Participation.findById(newParticipation._id)
             .populate("user", "email pseudo")
             .populate("challenge", "title")
             

        res.status(201).json({ message: "Participation créé avec succès", participation: populatedParticipation })
    } catch (error) {
        console.error("Erreur lors de la création de participation: ", error)
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error })
    }
}

export const getParticipationRanking = async (req, res) => {
    try {

        const ranking = await Participation.aggregate([
            // 1️⃣ Grouper par user + compter
            { $group: { 
                _id: "$user", 
                count: { $sum: 1 } 
            } 
            },
            // 2️⃣ Trier du + au - assidu
            { 
                $sort: { count: -1 } 
            },
            // 3️⃣ Faire un lookup vers la collection "users"
            {
               $lookup: {
                   from: "users",
                   localField: "_id",
                   foreignField: "_id",
                   as: "userInfo"
               } 
            },
            // 4️⃣ Déplier le tableau userInfo
            {
                $unwind : "$userInfo"
            },
            // 5️⃣ Choisir les champs à renvoyer
            {
                $project: {
                    _id: 0,
                    user: {
                        _id: "$userInfo._id",
                        pseudo: "$userInfo.pseudo",
                        email: "$userInfo.email"
                    },
                    count: 1
                }
            },
             // 🎁 Ici → TOP 5
            { $limit: 5 }
        ]);

        res.status(200).json({ message: `TOP ${ranking.length} des utilisateurs les plus assidus récupérés avec succès`, 
            ranking 
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du classement :", error)
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error });
    }
};

export const getParticipationByChallenge = async (req, res) => {
    try {
          const { challengeId } = req.params;
          const { userId, sort } = req.query;
        
        
          const limit = parseInt(req.query.limit) || 20;
          const page = parseInt(req.query.page) || 1;

        
          const searchFilter = { challenge: challengeId };

          if (userId) {
             searchFilter.user = userId;
          }

          // Déterminer le tri
          const sortOrder = sort === 'asc' ? 1 : -1;

          const totalParticipations = await Participation.countDocuments(searchFilter)

          const participations = await Participation.find(searchFilter)
              .populate("user", "pseudo email")
              .sort({ createdAt : sortOrder })
              .skip((page - 1) * limit)
              .limit(limit)

        
          const totalPages = Math.ceil(totalParticipations / limit)

          if (!participations.length) {
          return res.status(404).json({ message: "Aucune participation pour ce challenge" })
          }

          // 🚀 Ici → on formate les dates :
          const participationsFormatted = participations.map(part => ({
            _id: part._id,
            user: part.user,
            challenge: part.challenge,
            createdAt: format(part.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })
          }));

          res.status(200).json({ message: `Page ${page} - ${participations.length} participations récupérées pour ${challengeId}`,
                              filter: { challengeId, userId: userId || null, sort: sort || 'desc'},
                              count: participations.length,
                              limit,
                              page,
                              totalParticipations,
                              totalPages,
                              participations: participationsFormatted
                            })

        } catch (error) {
        console.error("Erreur lors de la récupération des participations: ", error);
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error })
        }
}

export const getTopParticipantsByChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const limit = parseInt(req.query.limit) || 5;


        console.log("➡️ Début de la récupération du TOP participants...");

        const topParticipants = await Participation.aggregate([
            { $match: { challenge: new mongoose.Types.ObjectId(challengeId) } },
            { $group: { _id: "$user", count: { $sum: 1} } },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }},
            { $unwind: "$user"},
            { $project: {
                _id: 0,
                userId: "$user._id",
                pseudo: "$user.pseudo",
                email: "$user.email",
                participationCount: "$count"
            }}
        ]);

        console.log(`➡️  Top ${limit} participants pour le challenge ${challengeId} :`);
        console.log(topParticipants);



        
        res.status(200).json({
            message : `Top ${limit} participants pour le challenge ${challengeId}`,
            topParticipants
        })
    } catch (error) {
        console.error("Erreur lors de la récupération du top participants: ", error);
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error })
    }
}

export const getParticipationByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const participations = await Participation.find({user: userId})
              .populate("challenge", "title")
              .sort(({ createdAt: -1 }));

        res.status(200).json({
            message: "Participations récupérées avec succès",
            participations
        });       
    } catch (error) {
        console.error("Erreur récupération participations :", error)
        res.status(500).json({ message: "Erreur serveur" });
    }
};
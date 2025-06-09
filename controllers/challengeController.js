import Challenge from "../models/challengeModel.js";
import Participation from "../models/participationModel.js";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const createChallenge = async (req, res) => {
    try {
        const { title, description, type, mediaUrl, author } = req.body;
        
        // Vérifier que tous les champs sont présents
        if (!title || !description || !type || !mediaUrl || !author) {
            return res.status(400).json({ message: "tous les champs sont requis" })
        }
        
        // Créer le challenge
        const newChallenge = await Challenge.create({ title, description, type, mediaUrl, author });

        const challengesFormatted = {
            _id: newChallenge._id,
            title: newChallenge.title,
            description: newChallenge.description,
            type: newChallenge.type,

        }
        
        res.status(201).json({ message: "Challenge créé avec succès", challenge : challengesFormatted })
    } catch (error) {
        console.error("Erreur dans la création du challenge :", error)
        res.status(500).json({message: "Une erreur est survenue, veuillez réessayer", error})
    }
}

export const getAllChallenge = async (req, res) => {
    try {
        const challenges = await Challenge.find()
        .populate("author", "pseudo email")
        .sort({ createdAt : -1 });

        const challengesFormatted = await Promise.all(
            challenges.map(async chal => {
                const participantCount = await Participation.countDocuments({ challenge: chal._id });


                return {
                    _id: chal._id,
                    title: chal.title,
                    description: chal.description,
                    type: chal.type,
                    mediaUrl: chal.mediaUrl,
                    author: chal.author,
                    participantCount,
                    createdAt: format(chal.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })
                }
            })
        )


        res.status(200).json({ 
            message: `Challenges récupérés avec succès, (${challengesFormatted.length})`,
            count: challengesFormatted.length,
            challenges: challengesFormatted
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des challenges", error);
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error})
    }
    
}

export const getChallengeById = async (req, res) => {
    try {
        const { id } = req.params;

        // On récupère le challenge avec populate
        const challenge = await Challenge.findById(id)
        .populate("author", "pseudo email")

        if (!challenge) {
            return res.status(404).json({ message: "Challenge introuvable"})
        }
        
        
        const participantCount = await Participation.countDocuments({ challenge: challenge._id })
        
        // On renvoie le challenge formaté
        res.status(200).json({ 
            message: "Challenge récupéré avec succès", 
            challenge: {
                _id: challenge._id,
                title: challenge.title,
                description: challenge.description,
                type: challenge.type,
                mediaUrl: challenge.mediaUrl,
                author: challenge.author,
                participantCount,
                createdAt: format(challenge.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr} )
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du challenge :", error)
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error})
    }
}

export const searchChallenges = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;


        const searchFilter = {
            $or: [
                { title: { $regex: keyword, $options: "i"} },
                { description: { $regex: keyword, $options: "i"} }
            ]
        };


        const totalChallenges = await Challenge.countDocuments(searchFilter)

        console.log("Filtre envoyé à MongoDB :", JSON.stringify(searchFilter, null, 2));

        const challenges = await Challenge.find(searchFilter)
              .populate("author", "pseudo email")
              .sort({ createdAt: -1 })
              .skip((page - 1) * limit)
              .limit(limit);

              const totalPages = Math.ceil(totalChallenges / limit)

        if (!challenges.length) {
            return res.status(404).json({ message: "Aucun challenge trouvé pour ce mot clé" });
        } 

        
        res.status(200).json({
            message: `Résultats pour ${keyword} - page ${page}`,
            page,
            limit,
            totalChallenges,
            totalPages,
            count: challenges.length,
            challenges
        })

    } catch (error) {
        console.error("Erreur lors de la recherche des challenges :", error)
        res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer", error })
    }
}

export const updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // les champs à modifier (title, description, etc.)

        const updatedChallenge = await Challenge.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true}
        );

        if (!updatedChallenge) {
            return res.status(404).json({ message: "Défi non trouvé" });
        }

        res.status(200).json({ message: "Défi mis à jour avec succès", 
                               challenge: updatedChallenge });
    
        } catch (error) {
            console.error("Erreur update challenge", error);
            res.status(500).json({ message: "Erreur serveur", error });
        }
}

export const deleteChallenge = async (req, res) =>  {
    try {
        const { id } = req.params;

        const deleteChallenge = await Challenge.findByIdAndDelete(id)

        if (!deleteChallenge) {
            return res.status(404).json({ message: "Challenge non trouvé" })
        }

        res.status(200).json({ message: "Challenge supprimé avec succès"})
    
    } catch (error) {
        console.error("Erreur suppression challenge", error)
        res.status(500).json({ message: "Erreur serveur", error })
    }
}
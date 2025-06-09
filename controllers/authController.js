import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { email, password, pseudo, phone } = req.body;

        // Vérifier que tous les champs sont présents
        if (!email || !password || !pseudo || !phone) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires" });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé"})
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // Créer l'utilisateur
        const newUser = new User({
            email,
            password: hashedPassword,
            pseudo,
            phone,
            role: "user"
            
        });

        // Sauvegarder dans la base 
        await newUser.save();

        // 🪙 Générer un token JWT
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.status(201).json({ message: "Utilisateur créé avec succès",
            user: {
                _id: newUser._id,
                email: newUser.email,
                pseudo: newUser.pseudo,
                phone: newUser.phone,
                role: newUser.role,
                },
            token
         });
    } catch (error) {
        console.error("Erreur inscription", error)
        res.status(500).json({ message: "Une erreur est survenue lors de l'inscription" });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "Utilisateur introuvable"})
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // 🔥 Générer un token JWT
        const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });


        res.status(200).json({ message: "Connexion réussie", token, user: { _id: existingUser._id, pseudo: existingUser.pseudo, email: existingUser.email, role: existingUser.role } })
    } catch (error) {
        console.error("Erreur de connexion :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}


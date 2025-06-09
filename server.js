import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import participationRoutes from './routes/participationRoutes.js'

// Charger les variables d'environnement
dotenv.config();



// Créer l'application Express
const app = express();

// Middleware pour lire les données JSON et formulaire
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes APi
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/participations', participationRoutes);

// Connexion à MongoDB (version moderne)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('Erreur de connexion MongoDB :', err));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

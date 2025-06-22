# 📚 API Défis & Messages PRO

API professionnelle de gestion de défis et de messagerie en temps réel.  
Développée en Node.js, Express et MongoDB.

🔗 [API en ligne disponible ici](https://defis-message-api.onrender.com/)

---

### ✳️ À savoir
> Cette API est exclusivement backend (pas de frontend).  
> L’URL de démo ci-dessus retourne simplement un message texte pour confirmer que l’API est active.  
> Pour tester les routes, utilisez Postman ou un outil similaire.

## 🚀 Fonctionnalités principales

✅ Authentification sécurisée (JWT)  
✅ Gestion des utilisateurs (register, login)  
✅ Création et gestion de défis  
✅ Participation aux défis (avec ranking)  
✅ Système de messagerie entre utilisateurs  
✅ Compteur de participants par défi  
✅ Nombre de messages envoyés par utilisateur  
✅ Protection des routes sensibles  
✅ Middleware Admin (gestion avancée)  
✅ Dates formatées en français lisible  
✅ Déploiement en production (Render)

---

## 🛠️ Stack technique

- **Backend** : Node.js + Express  
- **Base de données** : MongoDB Atlas + Mongoose  
- **Authentification** : JWT + bcrypt  
- **Déploiement** : Render  
- **Autres** : dotenv, cors, date-fns  

---

## 🔐 Routes principales

### Auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST    | /api/auth/register | Inscription utilisateur |
| POST    | /api/auth/login    | Connexion utilisateur (JWT) |

---

### Challenges

| Méthode | Route | Description |
|---------|-------|-------------|
| GET     | /api/challenges            | Liste des défis |
| GET     | /api/challenges/:id        | Détail d'un défi |
| POST    | /api/challenges            | Créer un défi *(admin)* |
| PUT     | /api/challenges/:id        | Modifier un défi *(admin)* |
| DELETE  | /api/challenges/:id        | Supprimer un défi *(admin)* |

---

### Participations

| Méthode | Route | Description |
|---------|-------|-------------|
| POST    | /api/participations        | Créer une participation |
| GET     | /api/participations/ranking | Classement des participants |
| GET     | /api/participations/challenge/:challengeId/top | Top participants par défi |
| GET     | /api/participations/challenge/:challengeId | Participations d'un défi |

---

### Messages

| Méthode | Route | Description |
|---------|-------|-------------|
| POST    | /api/messages/send        | Envoyer un message |
| GET     | /api/messages/:userId     | Récupérer les messages reçus |
| GET     | /api/messages/conversation/:userId1/:userId2 | Conversation entre 2 users |
| GET     | /api/messages/user/:userId/count | Nombre de messages envoyés |

---

## ⚙️ Installation locale

```bash
git clone https://github.com/melkash/defis-message-api.git
cd defis-message-api
npm install
```
## 📁 Configuration (.env)

Crée un fichier `.env` à la racine avec les variables suivantes :

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```


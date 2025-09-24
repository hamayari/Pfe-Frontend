// ===== SCRIPT DE CONFIGURATION MONGODB POUR LA BASE EXISTANTE =====

// Utiliser la base de données existante 'demo'
use demo;

// Créer les collections de messagerie
db.createCollection("users");
db.createCollection("conversations");
db.createCollection("messages");
db.createCollection("message_reactions");
db.createCollection("attachments");

// Créer les index pour les performances
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.conversations.createIndex({ "participants": 1 });
db.conversations.createIndex({ "isActive": 1 });
db.conversations.createIndex({ "updatedAt": -1 });

db.messages.createIndex({ "conversationId": 1 });
db.messages.createIndex({ "senderId": 1 });
db.messages.createIndex({ "receiverId": 1 });
db.messages.createIndex({ "timestamp": -1 });
db.messages.createIndex({ "isRead": 1 });

db.message_reactions.createIndex({ "messageId": 1 });
db.message_reactions.createIndex({ "userId": 1 });

db.attachments.createIndex({ "messageId": 1 });

// Insérer les données de test pour la messagerie
const commercialId = ObjectId();
const pmId = ObjectId();
const conversationId = ObjectId();

// Utilisateur Commercial
db.users.insertOne({
  _id: commercialId,
  username: "Commercial",
  email: "commercial@gestionpro.com",
  role: "commercial",
  avatar: "C",
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Utilisateur Project Manager
db.users.insertOne({
  _id: pmId,
  username: "Project Manager",
  email: "pm@gestionpro.com",
  role: "projectmanager",
  avatar: "P",
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Conversation de test
db.conversations.insertOne({
  _id: conversationId,
  name: "commercial - projectmanager",
  type: "DIRECT",
  participants: [commercialId, pmId],
  participantDetails: [
    {
      _id: commercialId,
      username: "Commercial",
      role: "commercial",
      avatar: "C"
    },
    {
      _id: pmId,
      username: "Project Manager",
      role: "projectmanager",
      avatar: "P"
    }
  ],
  unreadCount: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Messages de test
const messages = [
  {
    conversationId: conversationId,
    senderId: pmId,
    senderUsername: "Project Manager",
    senderRole: "projectmanager",
    senderAvatar: "P",
    receiverId: commercialId,
    receiverUsername: "Commercial",
    receiverRole: "commercial",
    content: "hi",
    messageType: "text",
    timestamp: new Date("2024-08-13T10:00:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:00:00"),
    updatedAt: new Date("2024-08-13T10:00:00")
  },
  {
    conversationId: conversationId,
    senderId: pmId,
    senderUsername: "Project Manager",
    senderRole: "projectmanager",
    senderAvatar: "P",
    receiverId: commercialId,
    receiverUsername: "Commercial",
    receiverRole: "commercial",
    content: "hi",
    messageType: "text",
    timestamp: new Date("2024-08-13T10:01:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:01:00"),
    updatedAt: new Date("2024-08-13T10:01:00")
  },
  {
    conversationId: conversationId,
    senderId: commercialId,
    senderUsername: "Commercial",
    senderRole: "commercial",
    senderAvatar: "C",
    receiverId: pmId,
    receiverUsername: "Project Manager",
    receiverRole: "projectmanager",
    content: "cc",
    messageType: "text",
    timestamp: new Date("2024-08-13T10:02:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:02:00"),
    updatedAt: new Date("2024-08-13T10:02:00")
  }
];

db.messages.insertMany(messages);

print("✅ Configuration MongoDB terminée !");
print("📊 Base de données: demo (existante)");
print("🔑 Collections de messagerie créées");
print("📝 Données de test insérées");
print("🎉 Prêt à utiliser avec votre Spring Boot !");

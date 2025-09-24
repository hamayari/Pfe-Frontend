// ===== SCHÉMA MONGODB POUR LA MESSAGERIE =====

// Collection users
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "role"],
      properties: {
        username: {
          bsonType: "string",
          description: "Nom d'utilisateur - requis"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email valide - requis"
        },
        role: {
          bsonType: "string",
          enum: ["commercial", "projectmanager", "admin", "decision-maker"],
          description: "Rôle utilisateur - requis"
        },
        avatar: {
          bsonType: "string",
          description: "Avatar pour la messagerie"
        },
        enabled: {
          bsonType: "bool",
          description: "Utilisateur activé"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Collection conversations
db.createCollection("conversations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "type", "participants"],
      properties: {
        name: {
          bsonType: "string",
          description: "Nom de la conversation - requis"
        },
        type: {
          bsonType: "string",
          enum: ["DIRECT", "GROUP", "CHANNEL"],
          description: "Type de conversation - requis"
        },
        participants: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Liste des IDs des participants - requis"
        },
        participantDetails: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["_id", "username", "role"],
            properties: {
              _id: {
                bsonType: "objectId",
                description: "ID de l'utilisateur"
              },
              username: {
                bsonType: "string",
                description: "Nom d'utilisateur"
              },
              role: {
                bsonType: "string",
                description: "Rôle de l'utilisateur"
              },
              avatar: {
                bsonType: "string",
                description: "Avatar de l'utilisateur"
              }
            }
          }
        },
        lastMessage: {
          bsonType: "object",
          description: "Dernier message de la conversation"
        },
        lastMessageTimestamp: {
          bsonType: "date",
          description: "Timestamp du dernier message"
        },
        unreadCount: {
          bsonType: "int",
          minimum: 0,
          description: "Nombre de messages non lus"
        },
        isActive: {
          bsonType: "bool",
          description: "Conversation active"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Collection messages
db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content", "senderId", "receiverId", "conversationId"],
      properties: {
        content: {
          bsonType: "string",
          description: "Contenu du message - requis"
        },
        senderId: {
          bsonType: "objectId",
          description: "ID de l'expéditeur - requis"
        },
        senderUsername: {
          bsonType: "string",
          description: "Nom d'utilisateur de l'expéditeur"
        },
        senderRole: {
          bsonType: "string",
          description: "Rôle de l'expéditeur"
        },
        senderAvatar: {
          bsonType: "string",
          description: "Avatar de l'expéditeur"
        },
        receiverId: {
          bsonType: "objectId",
          description: "ID du destinataire - requis"
        },
        receiverUsername: {
          bsonType: "string",
          description: "Nom d'utilisateur du destinataire"
        },
        receiverRole: {
          bsonType: "string",
          description: "Rôle du destinataire"
        },
        conversationId: {
          bsonType: "objectId",
          description: "ID de la conversation - requis"
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp du message"
        },
        isRead: {
          bsonType: "bool",
          description: "Message lu"
        },
        messageType: {
          bsonType: "string",
          enum: ["text", "file", "image"],
          description: "Type de message"
        },
        fileUrl: {
          bsonType: "string",
          description: "URL du fichier"
        },
        fileName: {
          bsonType: "string",
          description: "Nom du fichier"
        },
        fileSize: {
          bsonType: "long",
          description: "Taille du fichier en bytes"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        },
        updatedAt: {
          bsonType: "date",
          description: "Date de mise à jour"
        }
      }
    }
  }
});

// Collection message_reactions
db.createCollection("message_reactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["messageId", "userId", "emoji"],
      properties: {
        messageId: {
          bsonType: "objectId",
          description: "ID du message - requis"
        },
        userId: {
          bsonType: "objectId",
          description: "ID de l'utilisateur - requis"
        },
        emoji: {
          bsonType: "string",
          description: "Emoji de la réaction - requis"
        },
        createdAt: {
          bsonType: "date",
          description: "Date de création"
        }
      }
    }
  }
});

// Collection attachments
db.createCollection("attachments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["messageId", "fileName", "fileUrl", "fileType", "fileSize"],
      properties: {
        messageId: {
          bsonType: "objectId",
          description: "ID du message - requis"
        },
        fileName: {
          bsonType: "string",
          description: "Nom du fichier - requis"
        },
        originalFileName: {
          bsonType: "string",
          description: "Nom original du fichier"
        },
        fileUrl: {
          bsonType: "string",
          description: "URL du fichier - requis"
        },
        fileType: {
          bsonType: "string",
          description: "Type MIME du fichier - requis"
        },
        fileSize: {
          bsonType: "long",
          description: "Taille du fichier en bytes - requis"
        },
        uploadedAt: {
          bsonType: "date",
          description: "Date de téléchargement"
        }
      }
    }
  }
});

// Créer les index pour améliorer les performances
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
db.message_reactions.createIndex({ "messageId": 1, "userId": 1, "emoji": 1 }, { unique: true });

db.attachments.createIndex({ "messageId": 1 });
db.attachments.createIndex({ "fileType": 1 });

// Données de test
const commercialId = ObjectId();
const pmId = ObjectId();
const conversationId = ObjectId();

// Insérer l'utilisateur Commercial
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

// Insérer l'utilisateur Project Manager
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

// Insérer la conversation
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

// Insérer les messages de test
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
    senderId: pmId,
    senderUsername: "Project Manager",
    senderRole: "projectmanager",
    senderAvatar: "P",
    receiverId: commercialId,
    receiverUsername: "Commercial",
    receiverRole: "commercial",
    content: "hi",
    messageType: "text",
    timestamp: new Date("2024-08-13T10:02:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:02:00"),
    updatedAt: new Date("2024-08-13T10:02:00")
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
    timestamp: new Date("2024-08-13T10:03:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:03:00"),
    updatedAt: new Date("2024-08-13T10:03:00")
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
    content: "cc 👍",
    messageType: "text",
    timestamp: new Date("2024-08-13T10:04:00"),
    isRead: true,
    createdAt: new Date("2024-08-13T10:04:00"),
    updatedAt: new Date("2024-08-13T10:04:00")
  }
];

db.messages.insertMany(messages);

print("✅ Schéma MongoDB créé avec succès !");
print("📊 Collections créées : users, conversations, messages, message_reactions, attachments");
print("🔑 Index créés pour optimiser les performances");
print("📝 Données de test insérées");

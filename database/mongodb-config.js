// ===== CONFIGURATION MONGODB POUR LA MESSAGERIE =====

// Configuration de la base de données
const config = {
  // URL de connexion MongoDB
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  
  // Nom de la base de données
  databaseName: process.env.MONGO_DB_NAME || 'gestionpro_messaging',
  
  // Options de connexion
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false
  },
  
  // Collections de la base de données
  collections: {
    users: 'users',
    conversations: 'conversations',
    messages: 'messages',
    messageReactions: 'message_reactions',
    attachments: 'attachments'
  },
  
  // Index pour optimiser les performances
  indexes: {
    users: [
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } }
    ],
    conversations: [
      { key: { participants: 1 } },
      { key: { isActive: 1 } },
      { key: { updatedAt: -1 } }
    ],
    messages: [
      { key: { conversationId: 1 } },
      { key: { senderId: 1 } },
      { key: { receiverId: 1 } },
      { key: { timestamp: -1 } },
      { key: { isRead: 1 } }
    ],
    messageReactions: [
      { key: { messageId: 1 } },
      { key: { userId: 1 } },
      { key: { messageId: 1, userId: 1, emoji: 1 }, unique: true }
    ],
    attachments: [
      { key: { messageId: 1 } },
      { key: { fileType: 1 } }
    ]
  }
};

// Fonction pour créer la base de données et les collections
async function initializeDatabase() {
  try {
    const client = new Mongo(config.mongoUrl);
    const db = client.db(config.databaseName);
    
    console.log(`🔌 Connexion à MongoDB: ${config.mongoUrl}`);
    console.log(`📊 Base de données: ${config.databaseName}`);
    
    // Créer les collections avec validation
    for (const [collectionName, collection] of Object.entries(config.collections)) {
      try {
        await db.createCollection(collection);
        console.log(`✅ Collection créée: ${collection}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️ Collection existe déjà: ${collection}`);
        } else {
          console.error(`❌ Erreur création collection ${collection}:`, error.message);
        }
      }
    }
    
    // Créer les index
    for (const [collectionName, indexes] of Object.entries(config.indexes)) {
      const collection = db.collection(config.collections[collectionName]);
      
      for (const index of indexes) {
        try {
          await collection.createIndex(index.key, index.options || {});
          console.log(`🔑 Index créé pour ${collectionName}:`, Object.keys(index.key).join(', '));
        } catch (error) {
          console.error(`❌ Erreur création index pour ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Base de données initialisée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Fonction pour insérer les données de test
async function insertTestData() {
  try {
    const client = new Mongo(config.mongoUrl);
    const db = client.db(config.databaseName);
    
    console.log('📝 Insertion des données de test...');
    
    // Vérifier si les données existent déjà
    const existingUsers = await db.collection(config.collections.users).countDocuments();
    
    if (existingUsers === 0) {
      // Insérer les utilisateurs de test
      const commercialId = ObjectId();
      const pmId = ObjectId();
      const conversationId = ObjectId();
      
      // Utilisateur Commercial
      await db.collection(config.collections.users).insertOne({
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
      await db.collection(config.collections.users).insertOne({
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
      await db.collection(config.collections.conversations).insertOne({
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
      
      await db.collection(config.collections.messages).insertMany(messages);
      
      console.log('✅ Données de test insérées avec succès !');
    } else {
      console.log('ℹ️ Les données de test existent déjà');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données de test:', error);
  }
}

// Exporter les fonctions et la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    config,
    initializeDatabase,
    insertTestData
  };
} else {
  // Exécuter directement si dans MongoDB shell
  initializeDatabase().then(() => {
    insertTestData();
  });
}

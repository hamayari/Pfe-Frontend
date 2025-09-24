// import { ObjectId } from 'mongodb'; // Problème de dépendance
export type ObjectId = string; // Simulation pour le frontend

export interface Message {
  _id?: ObjectId;
  content: string;
  senderId: ObjectId;
  senderUsername: string;
  senderRole: string;
  senderAvatar: string;
  receiverId: ObjectId;
  receiverUsername: string;
  receiverRole: string;
  conversationId: ObjectId;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  _id?: ObjectId;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'CHANNEL';
  participants: ObjectId[]; // Array of user ObjectIds
  participantDetails: {
    _id: ObjectId;
    username: string;
    role: string;
    avatar: string;
  }[];
  lastMessage?: Message;
  lastMessageTimestamp?: Date;
  unreadCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SendMessageRequest {
  content: string;
  receiverId: string; // ObjectId as string
  conversationId?: string; // ObjectId as string
  messageType?: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface MessageResponse {
  success: boolean;
  message: Message;
  conversation?: Conversation;
  error?: string;
}

export interface ConversationResponse {
  success: boolean;
  conversations: Conversation[];
  error?: string;
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageStats {
  totalMessages: number;
  totalConversations: number;
  activeUsers: number;
  messagesToday: number;
  conversationsToday: number;
  averageResponseTime: number;
  topSenders: Array<{
    username: string;
    messageCount: number;
    role: string;
  }>;
  messagesByRole: Array<{
    role: string;
    count: number;
  }>;
}

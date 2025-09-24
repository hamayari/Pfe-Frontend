// Types pour les rôles et statuts
export type UserRole = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_COMMERCIAL' | 'ROLE_CHEF_PROJET' | 'ROLE_DECIDEUR' | 'ROLE_DECISION_MAKER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

// Interface principale pour l'utilisateur - Simplifiée et cohérente avec le backend
export interface User {
  // Informations de base (affichées dans le tableau)
  id: string;
  username: string; // Nom d'utilisateur (colonne "Nom")
  email: string; // Email (colonne "Email")
  firstName?: string;
  lastName?: string;
  
  // Rôles et statut (affichés dans le tableau)
  roles: UserRole[]; // Rôles (colonne "Rôles")
  status: UserStatus; // Statut (colonne "Statut")
  
  // Informations de création (affichées dans le tableau)
  createdAt: string; // Date de création (colonne "Créé le")
  
  // Informations supplémentaires (pour les formulaires)
  enabled?: boolean;
  active?: boolean;
  emailVerified?: boolean;
  locked?: boolean;
  mustChangePassword?: boolean;
  
  // Informations de profil
  profileImageUrl?: string;
  avatar?: string;
  phoneNumber?: string;
  country?: string;
  
  // Informations de sécurité
  blockReason?: string;
  blockedAt?: string;
  
  // Métadonnées
  updatedAt?: string;
}

// Interface pour la création d'un utilisateur (formulaire d'ajout)
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: UserRole[];
  enabled?: boolean;
  sendWelcomeEmail?: boolean;
}

// Interface pour la mise à jour d'un utilisateur
export interface UpdateUserRequest {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
  enabled?: boolean;
  status?: UserStatus;
}

// Interface pour la réponse de l'API utilisateur
export interface UserResponse {
  success: boolean;
  message: string;
  data?: User;
  errors?: string[];
}

// Interface pour la liste des utilisateurs
export interface UserListResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
  errors?: string[];
}

// Interface pour les filtres de recherche d'utilisateurs
export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface pour les statistiques utilisateur
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  newThisMonth: number;
  newThisWeek: number;
  byRole: {
    role: string;
    count: number;
    percentage: number;
  }[];
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

// Constantes pour les rôles (cohérentes avec l'affichage)
export const USER_ROLES: Record<UserRole, { name: string; description: string; color: string }> = {
  ROLE_SUPER_ADMIN: {
    name: 'Super Administrateur',
    description: 'Accès complet à toutes les fonctionnalités du système',
    color: '#9c27b0'
  },
  ROLE_ADMIN: {
    name: 'Administrateur',
    description: 'Gestion des utilisateurs, nomenclatures et paramètres système',
    color: '#3f51b5'
  },
  ROLE_COMMERCIAL: {
    name: 'Commercial',
    description: 'Gestion des conventions et factures',
    color: '#2196f3'
  },
  ROLE_CHEF_PROJET: {
    name: 'Chef de Projet',
    description: 'Gestion des projets et équipes',
    color: '#4caf50'
  },
  ROLE_DECIDEUR: {
    name: 'Décideur',
    description: 'Consultation des rapports et tableaux de bord',
    color: '#ff9800'
  },
  ROLE_DECISION_MAKER: {
    name: 'Décideur',
    description: 'Consultation des rapports et tableaux de bord',
    color: '#ff9800'
  }
};

// Constantes pour les statuts (cohérentes avec l'affichage)
export const USER_STATUSES: Record<UserStatus, { name: string; description: string; color: string }> = {
  ACTIVE: {
    name: 'Actif',
    description: 'Utilisateur actif et connecté',
    color: '#4caf50'
  },
  INACTIVE: {
    name: 'Inactif',
    description: 'Utilisateur inactif',
    color: '#f44336'
  },
  PENDING: {
    name: 'En attente',
    description: 'En attente d\'activation',
    color: '#ff9800'
  },
  SUSPENDED: {
    name: 'Suspendu',
    description: 'Compte temporairement suspendu',
    color: '#9e9e9e'
  }
};

// Fonctions utilitaires
export class UserUtils {
  static getRoleName(roleCode: UserRole): string {
    return USER_ROLES[roleCode]?.name || roleCode;
  }

  static getRoleColor(roleCode: UserRole): string {
    return USER_ROLES[roleCode]?.color || '#000000';
  }

  static getStatusName(status: UserStatus): string {
    return USER_STATUSES[status]?.name || status;
  }

  static getStatusColor(status: UserStatus): string {
    return USER_STATUSES[status]?.color || '#000000';
  }

  static isActive(user: User): boolean {
    return user.status === 'ACTIVE' && user.enabled !== false;
  }

  static canLogin(user: User): boolean {
    return user.status === 'ACTIVE' && user.enabled !== false && !user.locked;
  }

  static getDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }

  static getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  static getAvatarUrl(user: User): string {
    if (user.avatar) return user.avatar;
    if (user.profileImageUrl) return user.profileImageUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.getDisplayName(user))}&background=667eea&color=fff&size=128`;
  }

  static formatCreatedDate(createdAt: string): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static hasRole(user: User, role: UserRole): boolean {
    return user.roles && user.roles.includes(role);
  }

  static isSuperAdmin(user: User): boolean {
    return this.hasRole(user, 'ROLE_SUPER_ADMIN');
  }

  static isAdmin(user: User): boolean {
    return this.hasRole(user, 'ROLE_ADMIN') || this.hasRole(user, 'ROLE_SUPER_ADMIN');
  }
} 
export interface User {
  _id: string;
  id?: string; // Pour compatibilité
  username: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  avatar?: string;
  status: 'online' | 'offline';
  statusMessage?: string;
  needsPasswordChange: boolean;
  forcePasswordChange: boolean;
  enabled: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  notificationPreference?: any;
  createdAt: string;
  emailVerified: boolean;
  locked: boolean;
  lastLoginAt?: string;
  _class?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COMMERCIAL = 'COMMERCIAL',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DECISION_MAKER = 'DECISION_MAKER',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

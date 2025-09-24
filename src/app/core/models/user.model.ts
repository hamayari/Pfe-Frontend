import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

export { UserRole } from './user-role.enum';
export { UserStatus } from './user-status.enum';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isActive?: boolean;
  lastLogin?: Date;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  confirmPassword?: string;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

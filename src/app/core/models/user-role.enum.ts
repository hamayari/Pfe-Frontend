export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COMMERCIAL = 'COMMERCIAL',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DECISION_MAKER = 'DECISION_MAKER',
  GUEST = 'GUEST'
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.COMMERCIAL]: 'Commercial',
  [UserRole.PROJECT_MANAGER]: 'Project Manager',
  [UserRole.DECISION_MAKER]: 'Decision Maker',
  [UserRole.GUEST]: 'Guest'
};

export const UserRoleOptions = Object.values(UserRole).map(role => ({
  value: role,
  label: UserRoleLabel[role]
}));

// Role hierarchy - higher values have more permissions
export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.DECISION_MAKER]: 70,
  [UserRole.PROJECT_MANAGER]: 50,
  [UserRole.COMMERCIAL]: 30,
  [UserRole.GUEST]: 10
};

// Check if a user has required role or higher
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

// Get all roles that the user can manage
export function getManageableRoles(userRole: UserRole): UserRole[] {
  const userLevel = RoleHierarchy[userRole] || 0;
  return Object.entries(RoleHierarchy)
    .filter(([_, level]) => level < userLevel)
    .map(([role]) => role as UserRole);
}

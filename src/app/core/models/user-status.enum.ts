export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE'
}

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.PENDING]: 'Pending Activation',
  [UserStatus.SUSPENDED]: 'Suspended',
  [UserStatus.LOCKED]: 'Locked',
  [UserStatus.INACTIVE]: 'Inactive'
};

export const UserStatusOptions = Object.values(UserStatus).map(status => ({
  value: status,
  label: UserStatusLabel[status]
}));

export const UserStatusColor: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'accent',
  [UserStatus.PENDING]: 'primary',
  [UserStatus.SUSPENDED]: 'warn',
  [UserStatus.LOCKED]: 'warn',
  [UserStatus.INACTIVE]: ''
};

export function isActiveStatus(status: UserStatus): boolean {
  return status === UserStatus.ACTIVE;
}

export function isSuspendedOrLocked(status: UserStatus): boolean {
  return [UserStatus.SUSPENDED, UserStatus.LOCKED].includes(status);
}

export const Role = {
  ADMIN: 'admin',
  USER:  'user',
} as const;
export type RoleType = typeof Role[keyof typeof Role];
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  createdAt: string;
  lastActive?: string;
}

export const rolePermissions: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  admin: [
    'view_users', 'manage_users', 'view_broadcasts', 'send_broadcasts',
    'view_settings', 'edit_settings', 'view_analytics', 'export_reports',
    'view_agents', 'manage_agents', 'view_audit_logs'
  ],
  editor: [
    'view_users', 'view_broadcasts', 'send_broadcasts',
    'view_analytics', 'view_agents'
  ],
  viewer: [
    'view_users', 'view_broadcasts', 'view_analytics'
  ]
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  if (role === 'super_admin') return true;
  if (permission === 'manage_admins') return false; // Only super_admin
  if (permission === '*') return true; // Any authenticated admin
  const perms = rolePermissions[role] || [];
  return perms.includes(permission);
}

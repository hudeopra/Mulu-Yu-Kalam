export type AppRole = 'admin' | 'artist' | 'author';

export type PermissionKey =
  // Studio Appointments
  | 'appointments.view'
  | 'appointments.update_status'
  | 'appointments.edit_details'
  | 'appointments.delete'
  // Blog Posts
  | 'posts.view'
  | 'posts.create'
  | 'posts.edit_all'
  | 'posts.edit_own'
  | 'posts.delete'
  // Media Assets
  | 'media.upload'
  | 'media.delete'
  // Taxonomy (Categories & Tags)
  | 'taxonomy.manage'
  | 'taxonomy.delete'
  // Team & Users
  | 'users.view'
  | 'users.edit_own'
  | 'users.manage_roles'
  | 'users.delete'
  // System Settings
  | 'settings.permissions';

export type PermissionCategory =
  | 'Appointments'
  | 'Blog & Content'
  | 'Media Assets'
  | 'Taxonomy'
  | 'Team & Users'
  | 'System Settings';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: PermissionCategory;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Appointments
  {
    key: 'appointments.view',
    label: 'View Appointments Feed',
    description: 'Access the /admin appointments board, view client booking details and schedules.',
    category: 'Appointments',
  },
  {
    key: 'appointments.update_status',
    label: 'Update Booking Status',
    description: 'Transition appointments between Pending, Confirmed, Completed, and Canceled.',
    category: 'Appointments',
  },
  {
    key: 'appointments.edit_details',
    label: 'Edit Appointment Details',
    description: 'Modify appointment date, time, pricing, deposit amounts, and internal studio notes.',
    category: 'Appointments',
  },
  {
    key: 'appointments.delete',
    label: 'Delete Appointments & Artwork',
    description: 'Permanently or soft-delete appointments and remove client reference artwork from storage.',
    category: 'Appointments',
  },

  // Blog Posts
  {
    key: 'posts.view',
    label: 'View Blog Posts',
    description: 'Browse all published and draft articles in the Blog CMS panel.',
    category: 'Blog & Content',
  },
  {
    key: 'posts.create',
    label: 'Create New Articles',
    description: 'Draft and write new blog posts in the Lexical rich text editor.',
    category: 'Blog & Content',
  },
  {
    key: 'posts.edit_all',
    label: 'Edit Any Post',
    description: 'Edit, review, and modify articles authored by any team member.',
    category: 'Blog & Content',
  },
  {
    key: 'posts.edit_own',
    label: 'Edit Own Posts',
    description: 'Edit articles where the user is assigned as the primary author.',
    category: 'Blog & Content',
  },
  {
    key: 'posts.delete',
    label: 'Delete Blog Posts',
    description: 'Delete blog articles and version history drafts.',
    category: 'Blog & Content',
  },

  // Media
  {
    key: 'media.upload',
    label: 'Upload Media',
    description: 'Upload hero banners, blog illustrations, and design references to Cloudflare R2.',
    category: 'Media Assets',
  },
  {
    key: 'media.delete',
    label: 'Delete Media',
    description: 'Delete images and uploaded media files from Cloudflare R2 storage.',
    category: 'Media Assets',
  },

  // Taxonomy
  {
    key: 'taxonomy.manage',
    label: 'Manage Categories & Tags',
    description: 'Create and edit blog categories and featured editorial badges.',
    category: 'Taxonomy',
  },
  {
    key: 'taxonomy.delete',
    label: 'Delete Categories & Tags',
    description: 'Delete blog categories and feature tags.',
    category: 'Taxonomy',
  },

  // Team & Users
  {
    key: 'users.view',
    label: 'View Team List',
    description: 'View the user list, author profiles, and public bylines in the CMS.',
    category: 'Team & Users',
  },
  {
    key: 'users.edit_own',
    label: 'Edit Own Profile',
    description: 'Update personal display name, username, and public bio.',
    category: 'Team & Users',
  },
  {
    key: 'users.manage_roles',
    label: 'Manage Roles & Users',
    description: 'Create new user accounts, modify other profiles, and promote/demote roles.',
    category: 'Team & Users',
  },
  {
    key: 'users.delete',
    label: 'Delete User Accounts',
    description: 'Permanently remove staff and author user accounts.',
    category: 'Team & Users',
  },

  // System Settings
  {
    key: 'settings.permissions',
    label: 'Manage Permission Matrix',
    description: 'Access the dynamic permissions page to configure capabilities for all roles.',
    category: 'System Settings',
  },
];

export type RolePermissionsMatrix = Record<AppRole, Record<PermissionKey, boolean>>;

export const DEFAULT_PERMISSIONS_MATRIX: RolePermissionsMatrix = {
  admin: {
    'appointments.view': true,
    'appointments.update_status': true,
    'appointments.edit_details': true,
    'appointments.delete': true,
    'posts.view': true,
    'posts.create': true,
    'posts.edit_all': true,
    'posts.edit_own': true,
    'posts.delete': true,
    'media.upload': true,
    'media.delete': true,
    'taxonomy.manage': true,
    'taxonomy.delete': true,
    'users.view': true,
    'users.edit_own': true,
    'users.manage_roles': true,
    'users.delete': true,
    'settings.permissions': true,
  },
  artist: {
    'appointments.view': true,
    'appointments.update_status': true,
    'appointments.edit_details': true,
    'appointments.delete': false, // Admin only
    'posts.view': true,
    'posts.create': true,
    'posts.edit_all': true,
    'posts.edit_own': true,
    'posts.delete': false, // Admin only
    'media.upload': true,
    'media.delete': false, // Admin only
    'taxonomy.manage': true,
    'taxonomy.delete': false, // Admin only
    'users.view': true,
    'users.edit_own': true,
    'users.manage_roles': false, // Admin only
    'users.delete': false, // Admin only
    'settings.permissions': false, // Admin only
  },
  author: {
    'appointments.view': false, // Author has no access to appointments
    'appointments.update_status': false,
    'appointments.edit_details': false,
    'appointments.delete': false,
    'posts.view': true,
    'posts.create': true,
    'posts.edit_all': false,
    'posts.edit_own': true,
    'posts.delete': false,
    'media.upload': true,
    'media.delete': false,
    'taxonomy.manage': false,
    'taxonomy.delete': false,
    'users.view': false,
    'users.edit_own': true,
    'users.manage_roles': false,
    'users.delete': false,
    'settings.permissions': false,
  },
};

/**
 * Role-Based Session Security & Inactivity Policies
 */
export interface RoleSecurityPolicy {
  autoLogoutMinutes: number; // Inactivity timeout in minutes (0 = disabled)
}

export type RoleSecurityPolicies = Record<AppRole, RoleSecurityPolicy>;

export const DEFAULT_SECURITY_POLICIES: RoleSecurityPolicies = {
  admin: {
    autoLogoutMinutes: 60, // 1 Hour for Super Administrator
  },
  artist: {
    autoLogoutMinutes: 30, // 30 Minutes for Studio Artists
  },
  author: {
    autoLogoutMinutes: 15, // 15 Minutes for Blog Authors
  },
};

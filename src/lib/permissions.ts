import {
  type AppRole,
  type PermissionKey,
  type RolePermissionsMatrix,
  DEFAULT_PERMISSIONS_MATRIX,
} from '@/types/permissions';
import { supabase } from '@/lib/supabase';

/**
 * Checks if a given role has a specific permission.
 * Uses the supplied matrix or falls back to the default matrix.
 */
export function hasPermission(
  role: string | null | undefined,
  permission: PermissionKey,
  matrix?: RolePermissionsMatrix | null,
): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase() as AppRole;
  if (normalizedRole === 'admin') return true; // Super Admin always has full access

  const activeMatrix = matrix || DEFAULT_PERMISSIONS_MATRIX;
  const rolePermissions = activeMatrix[normalizedRole];
  if (!rolePermissions) return false;

  return Boolean(rolePermissions[permission]);
}

/**
 * Fetches the dynamic permissions matrix from Supabase `blog_role_permissions`.
 * If any role is missing or error occurs, gracefully merges with defaults.
 */
export async function getStoredPermissionsMatrix(): Promise<RolePermissionsMatrix> {
  try {
    const { data, error } = await supabase
      .from('blog_role_permissions')
      .select('role, permissions');

    if (error || !data || data.length === 0) {
      return DEFAULT_PERMISSIONS_MATRIX;
    }

    const merged: RolePermissionsMatrix = {
      admin: { ...DEFAULT_PERMISSIONS_MATRIX.admin },
      artist: { ...DEFAULT_PERMISSIONS_MATRIX.artist },
      author: { ...DEFAULT_PERMISSIONS_MATRIX.author },
    };

    for (const row of data) {
      const r = row.role as AppRole;
      if (merged[r] && row.permissions && typeof row.permissions === 'object') {
        merged[r] = {
          ...merged[r],
          ...row.permissions,
          ...(r === 'admin' ? DEFAULT_PERMISSIONS_MATRIX.admin : {}), // Admin remains strictly full access
        };
      }
    }

    return merged;
  } catch (err) {
    console.warn('[Permissions] Failed to fetch stored matrix, using defaults:', err);
    return DEFAULT_PERMISSIONS_MATRIX;
  }
}


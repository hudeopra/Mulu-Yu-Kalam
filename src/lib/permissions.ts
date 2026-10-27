import {
  type AppRole,
  type PermissionKey,
  type RolePermissionsMatrix,
  type RoleSecurityPolicies,
  DEFAULT_PERMISSIONS_MATRIX,
  DEFAULT_SECURITY_POLICIES,
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
 * Fetches both the dynamic permissions matrix and role session security policies from Supabase.
 */
export async function getStoredPermissionsAndPolicies(): Promise<{
  matrix: RolePermissionsMatrix;
  securityPolicies: RoleSecurityPolicies;
}> {
  try {
    const { data, error } = await supabase
      .from('blog_role_permissions')
      .select('role, permissions');

    if (error || !data || data.length === 0) {
      return {
        matrix: DEFAULT_PERMISSIONS_MATRIX,
        securityPolicies: DEFAULT_SECURITY_POLICIES,
      };
    }

    const mergedMatrix: RolePermissionsMatrix = {
      admin: { ...DEFAULT_PERMISSIONS_MATRIX.admin },
      artist: { ...DEFAULT_PERMISSIONS_MATRIX.artist },
      author: { ...DEFAULT_PERMISSIONS_MATRIX.author },
    };

    const mergedPolicies: RoleSecurityPolicies = {
      admin: { ...DEFAULT_SECURITY_POLICIES.admin },
      artist: { ...DEFAULT_SECURITY_POLICIES.artist },
      author: { ...DEFAULT_SECURITY_POLICIES.author },
    };

    for (const row of data) {
      const r = row.role as AppRole;
      if (row.permissions && typeof row.permissions === 'object') {
        const { _security_policy, ...perms } = row.permissions as any;

        if (mergedMatrix[r]) {
          mergedMatrix[r] = {
            ...mergedMatrix[r],
            ...perms,
            ...(r === 'admin' ? DEFAULT_PERMISSIONS_MATRIX.admin : {}), // Admin remains strictly full access
          };
        }

        if (_security_policy && typeof _security_policy === 'object') {
          mergedPolicies[r] = {
            ...mergedPolicies[r],
            ..._security_policy,
          };
        }
      }
    }

    return {
      matrix: mergedMatrix,
      securityPolicies: mergedPolicies,
    };
  } catch (err) {
    console.warn('[Permissions] Failed to fetch stored matrix & policies, using defaults:', err);
    return {
      matrix: DEFAULT_PERMISSIONS_MATRIX,
      securityPolicies: DEFAULT_SECURITY_POLICIES,
    };
  }
}

/**
 * Fetches the dynamic permissions matrix from Supabase `blog_role_permissions`.
 * If any role is missing or error occurs, gracefully merges with defaults.
 */
export async function getStoredPermissionsMatrix(): Promise<RolePermissionsMatrix> {
  const result = await getStoredPermissionsAndPolicies();
  return result.matrix;
}

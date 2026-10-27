import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  type AppRole,
  type RolePermissionsMatrix,
  type RoleSecurityPolicies,
  DEFAULT_PERMISSIONS_MATRIX,
  DEFAULT_SECURITY_POLICIES,
} from '@/types/permissions';
import { getStoredPermissionsAndPolicies } from '@/lib/permissions';

export async function GET() {
  try {
    const { matrix, securityPolicies } = await getStoredPermissionsAndPolicies();
    return NextResponse.json({ success: true, matrix, securityPolicies });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve permissions' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Parse incoming matrix & security policies payload
    const body = await req.json();
    const newMatrix = body?.matrix as RolePermissionsMatrix | undefined;
    const newPolicies = body?.securityPolicies as RoleSecurityPolicies | undefined;

    if (!newMatrix || typeof newMatrix !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid matrix payload provided' },
        { status: 400 },
      );
    }

    // 2. Validate session & verify user is an admin
    const cookieHeader = req.headers.get('cookie') || '';
    let isAdmin = false;

    // A) Check Payload CMS session
    try {
      const payloadMeRes = await fetch(
        new URL('/api/users/me', req.url).toString(),
        {
          headers: { cookie: cookieHeader },
        },
      );
      if (payloadMeRes.ok) {
        const pUser = await payloadMeRes.json();
        if (pUser?.user?.role === 'admin') {
          isAdmin = true;
        }
      }
    } catch {}

    // B) Check Supabase Auth session as fallback
    if (!isAdmin) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const role =
            (user.user_metadata?.role as string) ||
            (user.app_metadata?.role as string);
          if (role === 'admin') {
            isAdmin = true;
          }
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Super Administrators can alter permissions' },
        { status: 403 },
      );
    }

    // 3. Upsert roles into blog_role_permissions including security policies
    const roles: AppRole[] = ['admin', 'artist', 'author'];
    for (const r of roles) {
      const rolePerms =
        r === 'admin'
          ? { ...DEFAULT_PERMISSIONS_MATRIX.admin }
          : { ...DEFAULT_PERMISSIONS_MATRIX[r], ...(newMatrix[r] || {}) };

      const rolePolicy =
        newPolicies?.[r] && typeof newPolicies[r].autoLogoutMinutes === 'number'
          ? newPolicies[r]
          : DEFAULT_SECURITY_POLICIES[r];

      const { error } = await supabase
        .from('blog_role_permissions')
        .upsert(
          {
            role: r,
            permissions: {
              ...rolePerms,
              _security_policy: rolePolicy,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'role' },
        );

      if (error) {
        throw new Error(`Failed to save permissions for role ${r}: ${error.message}`);
      }
    }

    const updated = await getStoredPermissionsAndPolicies();
    return NextResponse.json({
      success: true,
      matrix: updated.matrix,
      securityPolicies: updated.securityPolicies,
    });
  } catch (error: any) {
    console.error('[Permissions API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update permissions' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { supabase } from '@/lib/supabase';
import {
  type AppRole,
  type RolePermissionsMatrix,
  type RoleSecurityPolicies,
  DEFAULT_PERMISSIONS_MATRIX,
  DEFAULT_SECURITY_POLICIES,
} from '@/types/permissions';
import {
  getStoredPermissionsAndPolicies,
  parsePermissionsRows,
} from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Try fetching directly via Payload's Postgres pool (super-fast, bypassing Supabase REST API and RLS)
    try {
      const payload = await getPayload({ config });
      const pool = (payload.db as any)?.pool;
      if (pool?.query) {
        const res = await pool.query('SELECT role, permissions FROM blog_role_permissions;');
        if (res?.rows && res.rows.length > 0) {
          const parsed = parsePermissionsRows(res.rows);
          return NextResponse.json({
            success: true,
            matrix: parsed.matrix,
            securityPolicies: parsed.securityPolicies,
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Permissions API GET] Postgres pool query fallback:', dbErr);
    }

    // 2. Fallback to Supabase client query or defaults
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
    const payload = await getPayload({ config });
    let isAdmin = false;

    // A) Check Payload CMS session via payload.auth
    try {
      const payloadAuth = await payload.auth({ headers: req.headers });
      if (payloadAuth?.user?.role === 'admin') {
        isAdmin = true;
      }
    } catch {}

    // B) Fallback: Check Payload /api/users/me endpoint
    if (!isAdmin) {
      const cookieHeader = req.headers.get('cookie') || '';
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
    }

    // C) Fallback: Check Supabase Auth session
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
    const pool = (payload.db as any)?.pool;

    // Ensure table and RLS policies exist in PostgreSQL
    if (pool?.query) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS blog_role_permissions (
            role VARCHAR(64) PRIMARY KEY,
            permissions JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          ALTER TABLE blog_role_permissions ENABLE ROW LEVEL SECURITY;
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'blog_role_permissions' AND policyname = 'Allow public select on blog_role_permissions'
            ) THEN
              CREATE POLICY "Allow public select on blog_role_permissions" 
              ON blog_role_permissions FOR SELECT USING (true);
            END IF;
          END $$;
        `);
      } catch (tableErr) {
        console.warn('[Permissions API] Table check/creation note:', tableErr);
      }
    }

    for (const r of roles) {
      const rolePerms =
        r === 'admin'
          ? { ...DEFAULT_PERMISSIONS_MATRIX.admin }
          : { ...DEFAULT_PERMISSIONS_MATRIX[r], ...(newMatrix[r] || {}) };

      const rolePolicy =
        newPolicies?.[r] && typeof newPolicies[r].autoLogoutMinutes === 'number'
          ? newPolicies[r]
          : DEFAULT_SECURITY_POLICIES[r];

      const permissionsData = {
        ...rolePerms,
        _security_policy: rolePolicy,
      };

      let saved = false;

      // Primary strategy: Save using direct Postgres pool (bypasses RLS with superuser permissions)
      if (pool?.query) {
        try {
          await pool.query(
            `INSERT INTO blog_role_permissions (role, permissions, updated_at)
             VALUES ($1, $2::jsonb, $3)
             ON CONFLICT (role)
             DO UPDATE SET
               permissions = EXCLUDED.permissions,
               updated_at = EXCLUDED.updated_at;`,
            [r, JSON.stringify(permissionsData), new Date().toISOString()],
          );
          saved = true;
        } catch (dbErr: any) {
          console.error(`[Permissions API] Postgres pool save error for role ${r}:`, dbErr);
        }
      }

      // Secondary strategy: Supabase Admin client with service_role key if available
      if (!saved && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const { error: sbAdminErr } = await supabaseAdmin
            .from('blog_role_permissions')
            .upsert(
              {
                role: r,
                permissions: permissionsData,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'role' },
            );
          if (!sbAdminErr) saved = true;
        } catch (adminClientErr) {
          console.warn('[Permissions API] Supabase admin client attempt note:', adminClientErr);
        }
      }

      // Fallback: Default Supabase client
      if (!saved) {
        const { error } = await supabase
          .from('blog_role_permissions')
          .upsert(
            {
              role: r,
              permissions: permissionsData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'role' },
          );

        if (error) {
          throw new Error(`Failed to save permissions for role ${r}: ${error.message}`);
        }
      }
    }

    // Read back updated permissions
    if (pool?.query) {
      try {
        const res = await pool.query('SELECT role, permissions FROM blog_role_permissions;');
        if (res?.rows && res.rows.length > 0) {
          const parsed = parsePermissionsRows(res.rows);
          return NextResponse.json({
            success: true,
            matrix: parsed.matrix,
            securityPolicies: parsed.securityPolicies,
          });
        }
      } catch (readErr) {
        console.warn('[Permissions API] Postgres pool re-read error:', readErr);
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

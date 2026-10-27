import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const cookieHeader = req.headers.get('cookie') || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let userEmail: string | null = null;

    // 1. Identify user from Supabase session
    if (supabaseUrl && supabaseAnonKey && cookieHeader) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return parseCookieHeader(cookieHeader);
            },
          },
        });
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (sbUser?.email) {
          userEmail = sbUser.email;
        }
      } catch (err) {
        console.warn('[Profile API] Supabase getUser error:', err);
      }
    }

    // 2. Fallback: Identify from Payload session
    if (!userEmail) {
      try {
        const payloadAuth = await payload.auth({ headers: req.headers });
        if (payloadAuth?.user?.email) {
          userEmail = payloadAuth.user.email;
        }
      } catch (err) {
        console.warn('[Profile API] Payload auth error:', err);
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Find user in Payload collection (blog_users)
    const userDocs = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userEmail,
        },
      },
      limit: 1,
    });

    if (!userDocs.docs[0]) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const doc = userDocs.docs[0];
    return NextResponse.json({
      user: {
        id: doc.id,
        email: doc.email,
        name: doc.name || '',
        username: doc.username || '',
        publicEmail: doc.publicEmail || '',
        role: doc.role || 'author',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[Profile API GET] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await req.json();
    const { name, username, publicEmail, email, password } = body;

    const cookieHeader = req.headers.get('cookie') || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let userEmail: string | null = null;

    // 1. Identify user from Supabase session
    if (supabaseUrl && supabaseAnonKey && cookieHeader) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return parseCookieHeader(cookieHeader);
            },
          },
        });
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (sbUser?.email) {
          userEmail = sbUser.email;
        }
      } catch {}
    }

    // 2. Fallback: Identify from Payload session
    if (!userEmail) {
      try {
        const payloadAuth = await payload.auth({ headers: req.headers });
        if (payloadAuth?.user?.email) {
          userEmail = payloadAuth.user.email;
        }
      } catch {}
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Find user in Payload collection
    const userDocs = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userEmail,
        },
      },
      limit: 1,
    });

    if (!userDocs.docs[0]) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const userDoc = userDocs.docs[0];
    const updateData: Record<string, any> = {};

    if (typeof name === 'string') {
      updateData.name = name.trim();
    }

    if (typeof username === 'string') {
      updateData.username = username
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._-]/g, '');
    }

    if (typeof publicEmail === 'string') {
      updateData.publicEmail = publicEmail.trim();
    }

    if (
      typeof email === 'string' &&
      email.trim() &&
      email.trim().toLowerCase() !== userDoc.email.toLowerCase()
    ) {
      updateData.email = email.trim().toLowerCase();
    }

    if (typeof password === 'string' && password.trim().length >= 6) {
      updateData.password = password.trim();
    }

    // Update in Payload CMS collection (blog_users in Supabase PostgreSQL)
    const updated = await payload.update({
      collection: 'users',
      id: userDoc.id,
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name || '',
        username: updated.username || '',
        publicEmail: updated.publicEmail || '',
        role: updated.role || 'author',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    console.error('[Profile API PATCH] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Verify caller credentials via Supabase SSR client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieHeader);
        },
      },
    });

    const {
      data: { user: sbUser },
      error: sbErr,
    } = await supabase.auth.getUser();

    const normalizedEmail = email.toLowerCase().trim();

    // Verify identity: caller must have a valid Supabase session matching this email
    if (sbErr || !sbUser || sbUser.email?.toLowerCase().trim() !== normalizedEmail) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const payload = await getPayload({ config });

    // Look up user in Payload collection
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      // Synchronize the user's password in Payload CMS
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { password },
        overrideAccess: true,
      });
    } else {
      // Provision user in Payload CMS with matching credentials and role
      const userRole = (sbUser.user_metadata?.role as any) || (sbUser.app_metadata?.role as any) || 'author';
      await payload.create({
        collection: 'users',
        data: {
          email: normalizedEmail,
          password,
          role: userRole,
          name: (sbUser.user_metadata?.name as string) || '',
          username: (sbUser.user_metadata?.username as string) || '',
        },
        overrideAccess: true,
      });
    }

    // Authenticate with Payload to issue official payload-token cookie
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: normalizedEmail,
        password,
      },
    });

    const res = NextResponse.json({
      success: true,
      user: loginResult.user,
    });

    if (loginResult.token) {
      res.cookies.set('payload-token', loginResult.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30-day session
      });
    }

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync session failed';
    console.error('[SyncSession API] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

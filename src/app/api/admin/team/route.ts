import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

async function checkIsAdmin(req: NextRequest): Promise<{ isAdmin: boolean; currentUserEmail: string | null }> {
  const payload = await getPayload({ config });
  let currentUserEmail: string | null = null;
  let isAdmin = false;

  const cookieHeader = req.headers.get('cookie') || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Supabase Auth
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
        currentUserEmail = sbUser.email;
        const role =
          (sbUser.user_metadata?.role as string) ||
          (sbUser.app_metadata?.role as string);
        if (role === 'admin') {
          isAdmin = true;
        }
      }
    } catch {}
  }

  // 2. Payload Auth
  if (!isAdmin || !currentUserEmail) {
    try {
      const payloadAuth = await payload.auth({ headers: req.headers });
      if (payloadAuth?.user?.email) {
        currentUserEmail = payloadAuth.user.email;
        if (payloadAuth.user.role === 'admin') {
          isAdmin = true;
        }
      }
    } catch {}
  }

  // Double check in DB if role not directly admin in session
  if (!isAdmin && currentUserEmail) {
    try {
      const userDocs = await payload.find({
        collection: 'users',
        where: {
          email: { equals: currentUserEmail.toLowerCase().trim() },
        },
        limit: 1,
        overrideAccess: true,
      });
      if (userDocs.docs[0]?.role === 'admin') {
        isAdmin = true;
      }
    } catch {}
  }

  return { isAdmin, currentUserEmail };
}

// GET: Retrieve all team members
export async function GET(req: NextRequest) {
  try {
    const { isAdmin } = await checkIsAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Administrators can view team members' },
        { status: 403 },
      );
    }

    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'users',
      limit: 100,
      sort: 'id',
      overrideAccess: true,
    });

    const members = result.docs.map((doc) => ({
      id: doc.id,
      email: doc.email,
      name: doc.name || '',
      username: doc.username || '',
      publicEmail: doc.publicEmail || '',
      role: doc.role || 'author',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ success: true, members });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch team';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create a new team member
export async function POST(req: NextRequest) {
  try {
    const { isAdmin } = await checkIsAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Administrators can create team members' },
        { status: 403 },
      );
    }

    const payload = await getPayload({ config });
    const body = await req.json();
    const { name, username, publicEmail, email, password, role } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const cleanUsername =
      typeof username === 'string' && username.trim()
        ? username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '')
        : null;

    const cleanPublicEmail =
      typeof publicEmail === 'string' && publicEmail.trim()
        ? publicEmail.trim()
        : null;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 },
      );
    }

    // Create in Payload
    const newDoc = await payload.create({
      collection: 'users',
      data: {
        name: typeof name === 'string' ? name.trim() : '',
        username: cleanUsername,
        publicEmail: cleanPublicEmail,
        email: normalizedEmail,
        password: password.trim(),
        role: role || 'author',
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      member: {
        id: newDoc.id,
        email: newDoc.email,
        name: newDoc.name || '',
        username: newDoc.username || '',
        publicEmail: newDoc.publicEmail || '',
        role: newDoc.role || 'author',
        createdAt: newDoc.createdAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update member details, password, or primary email (Danger Zone)
export async function PATCH(req: NextRequest) {
  try {
    const { isAdmin } = await checkIsAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Administrators can modify team members' },
        { status: 403 },
      );
    }

    const payload = await getPayload({ config });
    const body = await req.json();
    const { id, name, username, publicEmail, email, password, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    const existingDoc = await payload.findByID({
      collection: 'users',
      id,
      overrideAccess: true,
    });

    if (!existingDoc) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (typeof name === 'string') {
      updateData.name = name.trim();
    }

    if (username !== undefined) {
      const cleanUsername =
        typeof username === 'string' && username.trim()
          ? username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '')
          : null;
      updateData.username = cleanUsername;
    }

    if (publicEmail !== undefined) {
      const cleanPublicEmail =
        typeof publicEmail === 'string' && publicEmail.trim()
          ? publicEmail.trim()
          : null;
      updateData.publicEmail = cleanPublicEmail;
    }

    if (typeof role === 'string' && ['admin', 'artist', 'author'].includes(role)) {
      updateData.role = role;
    }

    // Danger Zone: Primary Email Update
    if (typeof email === 'string' && email.trim() && email.toLowerCase().trim() !== existingDoc.email.toLowerCase()) {
      const normalizedNewEmail = email.toLowerCase().trim();
      // Check for collision
      const checkCollision = await payload.find({
        collection: 'users',
        where: { email: { equals: normalizedNewEmail } },
        limit: 1,
        overrideAccess: true,
      });

      if (checkCollision.docs.length > 0 && checkCollision.docs[0].id !== id) {
        return NextResponse.json(
          { error: 'Email address is already in use by another team member.' },
          { status: 400 },
        );
      }
      updateData.email = normalizedNewEmail;
    }

    // Password Update via Popup
    if (typeof password === 'string' && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 },
        );
      }
      updateData.password = password.trim();
    }

    const updated = await payload.update({
      collection: 'users',
      id,
      data: updateData,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updated.id,
        email: updated.email,
        name: updated.name || '',
        username: updated.username || '',
        publicEmail: updated.publicEmail || '',
        role: updated.role || 'author',
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove team member
export async function DELETE(req: NextRequest) {
  try {
    const { isAdmin, currentUserEmail } = await checkIsAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Administrators can remove team members' },
        { status: 403 },
      );
    }

    const payload = await getPayload({ config });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    const targetUser = await payload.findByID({
      collection: 'users',
      id,
      overrideAccess: true,
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Team member not found.' }, { status: 404 });
    }

    // Safety guard: cannot delete yourself
    if (currentUserEmail && targetUser.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Safety Guard: You cannot delete your own administrator account.' },
        { status: 400 },
      );
    }

    await payload.delete({
      collection: 'users',
      id,
      overrideAccess: true,
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


import type { CollectionConfig } from 'payload'
import { jwtSign } from 'payload'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import crypto from 'crypto'

function verifyPayloadToken(
  token: string,
  secret: string,
): { id: number | string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url')
    if (signatureB64 !== expectedSig) return null
    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (data.exp && data.exp * 1000 < Date.now()) return null
    if (!data.id) return null
    return data
  } catch {
    return null
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  dbName: 'blog_users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'username', 'publicEmail', 'role', 'email', 'createdAt'],
    // Only admins see the Users collection link in the sidebar
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    // Allows public blog bylines & author queries
    read: () => true,
    // Only admins can create new user accounts
    create: ({ req: { user } }) => user?.role === 'admin',
    // Admins can update any user; non-admins can only update their own profile
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only admins can delete user accounts
    delete: ({ req: { user } }) => user?.role === 'admin',
    // Authenticated users can access the CMS panel
    admin: ({ req: { user } }) => Boolean(user),
  },
  auth: {
    useSessions: false, // Disables server sessions for dual Supabase & Payload JWT auth
    maxLoginAttempts: 0, // Disables auto-lockout when using dual Supabase & Payload auth
    tokenExpiration: 30 * 24 * 60 * 60, // 30-day session token (prevents premature session expiration)
    strategies: [
      {
        name: 'supabase',
        authenticate: async ({ headers, payload }) => {
          const cookieHeader = headers.get('cookie') || ''
          const cookiePrefix = payload.config.cookiePrefix || 'payload'
          const tokenCookieName = `${cookiePrefix}-token`

          // FAST PATH 1: If an unexpired payload-token cookie exists, verify directly in memory
          // with 0ms network latency and return the user document immediately
          const tokenMatch = cookieHeader.match(new RegExp(`${tokenCookieName}=([^;]+)`))
          if (tokenMatch && tokenMatch[1]) {
            const verified = verifyPayloadToken(tokenMatch[1], payload.secret)
            if (verified?.id) {
              try {
                const userDoc = await payload.findByID({
                  collection: 'users',
                  id: verified.id,
                  overrideAccess: true,
                })
                if (userDoc) {
                  return {
                    user: {
                      ...userDoc,
                      collection: 'users',
                      _strategy: 'supabase',
                    },
                  }
                }
              } catch {
                // If user retrieval fails, fall through to Supabase auth check below
              }
            }
          }

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (!supabaseUrl || !supabaseAnonKey || !cookieHeader) {
            return { user: null }
          }

          // FAST PATH 2: If no Supabase auth cookie is present, avoid external network request
          if (!cookieHeader.includes('sb-') && !cookieHeader.includes('supabase-')) {
            return { user: null }
          }

          try {
            const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
              cookies: {
                getAll() {
                  return parseCookieHeader(cookieHeader)
                },
              },
            })

            const {
              data: { user: sbUser },
              error,
            } = await supabase.auth.getUser()

            if (error || !sbUser?.email) {
              return { user: null }
            }

            const normalizedEmail = sbUser.email.toLowerCase().trim()

            // Check if user already exists in Payload
            let userDoc: any = null
            const existing = await payload.find({
              collection: 'users',
              where: {
                email: {
                  equals: normalizedEmail,
                },
              },
              limit: 1,
              overrideAccess: true,
            })

            if (existing.docs.length > 0) {
              userDoc = existing.docs[0]
            } else {
              // Auto-provision Supabase user into Payload
              userDoc = await payload.create({
                collection: 'users',
                data: {
                  email: normalizedEmail,
                  password: Math.random().toString(36).slice(-10) + 'A1!xyz',
                  role: (sbUser.user_metadata?.role as any) || 'admin',
                  name: (sbUser.user_metadata?.name as string) || '',
                  username: (sbUser.user_metadata?.username as string) || '',
                },
                overrideAccess: true,
              })
            }

            if (!userDoc) {
              return { user: null }
            }

            // Issue a fresh payload-token cookie in responseHeaders so subsequent requests
            // use local-jwt directly with zero Supabase network latency
            const responseHeaders = new Headers()
            try {
              const { token } = await jwtSign({
                fieldsToSign: {
                  id: userDoc.id,
                  collection: 'users',
                  email: userDoc.email,
                },
                secret: payload.secret,
                tokenExpiration: 30 * 24 * 60 * 60,
              })
              if (token) {
                const isProd = process.env.NODE_ENV === 'production'
                responseHeaders.append(
                  'Set-Cookie',
                  `${tokenCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isProd ? '; Secure' : ''}`,
                )
              }
            } catch (signErr) {
              console.warn('[Users auth] jwtSign error:', signErr)
            }

            return {
              user: {
                ...userDoc,
                collection: 'users',
                _strategy: 'supabase',
              },
              responseHeaders,
            }
          } catch (e) {
            console.error('[Payload Supabase Auth Strategy] Error:', e)
            return { user: null }
          }
        },
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      admin: {
        description: 'Full name displayed publicly on articles and author bylines (e.g. "Jane Doe")',
      },
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      unique: true,
      index: true,
      admin: {
        description: 'Unique public username/handle (e.g. "janedoe")',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value === 'string') {
              const cleaned = value.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '')
              return cleaned || null
            }
            return value || null
          },
        ],
      },
    },
    {
      name: 'publicEmail',
      type: 'email',
      label: 'Public Email',
      admin: {
        description: 'Optional public contact email for this author. If left empty, the site default from .env is used.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value === 'string') {
              const cleaned = value.trim()
              return cleaned || null
            }
            return value || null
          },
        ],
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      defaultValue: 'author',
      access: {
        // Only admins can change user roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Artist', value: 'artist' },
        { label: 'Author', value: 'author' },

      ],
      admin: {
        description: 'Designation / role within the editorial team',
      },
    },
  ],
  versions: false,
}

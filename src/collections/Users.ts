import type { CollectionConfig } from 'payload'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    strategies: [
      {
        name: 'supabase',
        authenticate: async ({ headers, payload }) => {
          const cookieHeader = headers.get('cookie') || ''
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (!supabaseUrl || !supabaseAnonKey || !cookieHeader) {
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

            // Check if user already exists in Payload
            const existing = await payload.find({
              collection: 'users',
              where: {
                email: {
                  equals: sbUser.email,
                },
              },
              limit: 1,
            })

            if (existing.docs.length > 0) {
              const user = existing.docs[0]
              return {
                user: {
                  ...user,
                  collection: 'users',
                  _strategy: 'supabase',
                },
              }
            }

            // Auto-provision Supabase admin into Payload
            const newUser = await payload.create({
              collection: 'users',
              data: {
                email: sbUser.email,
                password: Math.random().toString(36).slice(-10) + 'A1!xyz',
              },
            })

            return {
              user: {
                ...newUser,
                collection: 'users',
                _strategy: 'supabase',
              },
            }
          } catch (e) {
            console.error('[Payload Supabase Auth Strategy] Error:', e)
            return { user: null }
          }
        },
      },
    ],
  },
  fields: [],
  versions: false,
}

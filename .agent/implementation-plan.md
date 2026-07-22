# Implementation Checklist & Task Progress

This file tracks the operational execution across the 5 project phases. Tasks will be checked off (`[x]`) as each step is completed.

---

## Phase 1: Core Setup & Client-Side Compression

- [x] **1.1 Configure Environment**: Update `.gitignore` to prevent `.env` leaks, create `.env` with Supabase keys, and commit `.env.example`.
- [x] **1.2 Install Dependencies**: Run `pnpm add @supabase/supabase-js react-router`.
- [x] **1.3 Create Supabase Client**: Create `src/lib/supabase.ts` singleton client with TypeScript types and `VITE_`/`NEXT_PUBLIC_` fallback.
- [ ] **1.4 Build Canvas Compressor**: Implement `src/utils/imageCompressor.ts` using native HTML5 `<canvas>` to downscale (max 1600px) and enforce size <= 500KB.
- [ ] **1.5 Upgrade FileUpload UI**: Update `src/components/FileUpload.tsx` to auto-compress on select/drop, show reduction badge, and display preview.

## Phase 2: Booking Form & Database Pipeline

- [ ] **2.1 Update Zod Schema**: Update `src/schemas/appointmentSchema.ts` with strict 500KB validation rule.
- [ ] **2.2 Storage Upload**: Connect form to upload compressed file to `tattoo-references` bucket and obtain public URL.
- [ ] **2.3 Database Insert**: Insert booking record into `public.appointments` table.
- [ ] **2.4 UI States & Confirmation**: Add loading states ("Optimizing...", "Uploading...", "Booking...") and show confirmation card with Supabase UUID.

## Phase 3: Authentication & Security Guard

- [ ] **3.1 Auth Context Provider**: Implement `src/context/AuthContext.tsx` with Supabase Auth state listener (`signInWithPassword`, `signOut`, session tokens).
- [ ] **3.2 Staff Login Page**: Create `src/pages/LoginPage.tsx` with branded theme, loading state, and error handling.
- [ ] **3.3 Protected Route Guard**: Create `src/components/auth/ProtectedRoute.tsx` to guard `/admin` routes and redirect unauthorized visitors.

## Phase 4: Appointments Dashboard, Detailed Inspector & Status Editor

- [ ] **4.1 Router Setup**: Configure `src/App.tsx` with `react-router-dom` routes (`/`, `/login`, `/admin`).
- [ ] **4.2 Admin Dashboard View**: Create `src/pages/AdminDashboard.tsx` displaying appointments list/table ordered by newest with real-time feed.
- [ ] **4.3 Detailed Appointment Modal / Drawer**: Create `src/components/admin/AppointmentDetailModal.tsx` allowing staff to:
  - Inspect client contact info with direct WhatsApp/Call/Email links.
  - View full-res reference artwork with zoom lightbox & download.
  - Reschedule date & time.
  - Toggle status (`pending`, `confirmed`, `completed`, `canceled`).
  - Edit internal staff notes, price estimates, and deposit status.
- [ ] **4.4 Search, Filter & Deletion**: Add search by name/phone/email, status filter tabs, and deletion for canceled appointments.

## Phase 5: Verification, Production Build & Documentation Sync

- [ ] **5.1 Typecheck**: Run `pnpm exec tsc --noEmit` to ensure zero TypeScript errors across all pages, modals, and contexts.
- [ ] **5.2 Production Build**: Run `pnpm run build` to confirm clean bundle build.
- [ ] **5.3 Progress Sync**: Check off all tasks in this checklist and record milestone in `.agent/project-log.md`.

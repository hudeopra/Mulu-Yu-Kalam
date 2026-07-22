# System Architecture & Technical Planning Document: Supabase Integration, Auth, Appointments Management & Detailed Editor

## 1. Executive Summary & Platform Scope

This document specifies the complete system architecture, data models, security policies, and application flows for the **Mulu Yu Kalam** platform across both client-facing and studio administration capabilities:

1. **Public Landing Experience**: High-performance marketing portal, responsive asymmetric gallery, tattoo booking form, and in-browser image optimization engine.
2. **Supabase Data & Storage Pipeline**: Scalable PostgreSQL database with Row Level Security (RLS) and public asset storage with role-based policies.
3. **Studio Staff Authentication**: Supabase Auth with JWT session persistence, automatic token refreshes, and protected route guards.
4. **Appointments Management & Detailed Editor**:
   - **Dashboard View**: Live data feed with status filters, search, placement pills, and thumbnail previews.
   - **Detailed View & Edit Modal / Drawer**: Full appointment inspector allowing staff to preview high-res artwork, reschedule dates/times, change statuses (`pending`, `confirmed`, `completed`, `canceled`), record price quotes/deposits, and add internal staff notes.

---

## 2. Supabase Setup Guide (Step-by-Step for Dashboard)

Since you have already configured the `tattoo-references` storage bucket, here are the remaining two setups needed in your Supabase Dashboard:

### 2.1 Finalized Database Schema (Run in Supabase SQL Editor)

Go to your **Supabase Dashboard -> SQL Editor**, paste and run this SQL:

```sql
-- 1. Create the finalized appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  tattoo_location text not null,
  name text not null,
  email text not null,
  phone text not null,
  appointment_date date not null,
  appointment_time text not null,
  reference_image_url text,
  notes text,                           -- Client's notes submitted during booking
  internal_notes text,                  -- Staff private notes & studio remarks
  estimated_price numeric(10,2),        -- Optional price quote
  deposit_status text default 'unpaid', -- 'unpaid', 'paid', 'partial'
  status text default 'pending'         -- 'pending', 'confirmed', 'completed', 'canceled'
);

-- 2. Enable Row Level Security (RLS)
alter table public.appointments enable row level security;

-- 3. Public visitors (anon) and staff (authenticated) can INSERT new bookings
create policy "Public can book appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (true);

-- 4. Allow reading appointments (for instant booking confirmation & staff dashboard)
create policy "Allow viewing appointments"
  on public.appointments
  for select
  to anon, authenticated
  using (true);

-- 5. Only authenticated staff can UPDATE appointments (rescheduling, status, notes, price)
create policy "Staff can update appointments"
  on public.appointments
  for update
  to authenticated
  using (true)
  with check (true);

-- 6. Only authenticated staff can DELETE appointments
create policy "Staff can delete appointments"
  on public.appointments
  for delete
  to authenticated
  using (true);
```

### 2.2 Supabase Auth Setup (Creating Your Staff Account)

1. In your Supabase Dashboard, click **Authentication** in the left sidebar.
2. Click **Users** -> Click the green **Add user** button -> Select **Create user**.
3. Enter:
   - **Email**: Your studio email (e.g. `admin@muluyukalam.com` or your personal email).
   - **Password**: A strong password for logging into the dashboard.
   - **Auto Confirm User**: Ensure this is checked **ON** (so you can log in immediately without waiting for an email confirmation link).
4. Click **Create user**.
   _(That's all! Supabase Auth is enabled by default for Email/Password, generates JWTs, and handles password hashing securely)._

---

## 3. Platform Architecture: Public Landing Page vs. Internal Invoicing App

### 3.1 Architectural Isolation Strategy

- **Public Marketing & Appointment Landing Page** (`mulu-yu-kalam`): Public-facing (`anon` role), lightweight, fast, no administrative bundles.
- **Internal Invoicing & Studio Management** (`invoice-generator`): Private/internal tool for studio staff.
- **Shared Database Model**: Both point to `https://ffvlzlabxetifjybthiw.supabase.co`. When a visitor books an appointment, it writes directly into `public.appointments`. Your invoicing app can immediately read this table to view bookings or convert clients into `customers` and `invoices`.

---

## 4. Application Routing & Architecture

Using **`react-router-dom`**:

```
[Application Routes]
       ├── /                          ► Public Landing Page (Hero, About, Gallery, Booking Form)
       ├── /login                     ► Studio Staff Login (Supabase Auth)
       └── /admin                     ► Protected Admin Portal (Staff Only)
             ├── /admin               ► Appointments Dashboard Table & Live Feed
             └── /admin/details (modal)► Full Appointment Inspector & Edit Drawer
```

### 4.1 Route Guard Architecture (`src/components/auth/ProtectedRoute.tsx`)

- Listens to `supabase.auth.onAuthStateChange`.
- Redirects unauthenticated visitors to `/login`.
- Renders administrative views with live session management and sign-out controls.

---

## 5. Appointments Management & Detailed Editor (`/admin`)

### 5.1 Dashboard Overview Table

- **Live Feed**: Ordered by `created_at desc` with real-time updates via Supabase channels.
- **Columns**: Client Name, Contact (Email & Phone), Placement area badge, Date & Time, Status badge, Reference Thumbnail, and "Inspect / Edit" action button.
- **Search & Filters**: Instant filter by status (`All`, `Pending`, `Confirmed`, `Completed`, `Canceled`), placement area, and name/phone search.

### 5.2 Detailed View & Editor Drawer / Modal

When clicking on an appointment, a comprehensive management drawer opens containing:

1. **Client Contact & Communication**:
   - Quick action buttons: **WhatsApp** (`https://wa.me/<phone>`), **Call**, and **Email**.
2. **Reference Artwork Studio Viewer**:
   - Full-resolution view of the client's uploaded reference image.
   - Zoom lightbox and direct download button.
3. **Editable Fields (Staff Updates)**:
   - **Status Selector**: Instant toggle between 🟡 `pending`, 🟢 `confirmed`, 🔵 `completed`, and 🔴 `canceled`.
   - **Rescheduling**: Date and Time pickers to modify the session if the client requests a reschedule.
   - **Financial Tracking**: Input fields for `estimated_price` and `deposit_status` (`unpaid`, `paid`, `partial`).
   - **Internal Studio Notes**: Textarea for staff remarks (e.g. "Needs 2 sessions", "Client requested black and grey only", "Allergic to latex").
4. **Save & Delete Actions**:
   - **Save Changes**: Executes `supabase.from('appointments').update(...)` with optimistic UI update.
   - **Delete**: Prompts confirmation before removing canceled appointments.

---

## 6. Storage Architecture: Tattoo Reference Assets

- **Bucket Name**: `tattoo-references` (Public)
- **Storage Policies**:
  - **Upload & View (`INSERT`, `SELECT`)**: Roles `anon`, `authenticated`.
  - **Delete & Replace (`DELETE`, `UPDATE`)**: Role `authenticated` only.

---

## 7. In-Browser Image Optimization & 500KB Constraint

### 7.1 Canvas Compressor Engine (`src/utils/imageCompressor.ts`)

- **Downscaling**: Scales high-resolution mobile photos to max 1600px dimension preserving linework clarity.
- **Format**: Modern WebP encoding with progressive JPEG fallback.
- **Iterative Loop**: Auto-tunes quality until file payload is strictly **<= 500KB**.
- **Live UX Metrics**: Displays `Original size → Compressed size (-X%)`.
- **Zod Guard**: Enforces 500KB maximum size ceiling in form schema.

---

## 8. Phased Implementation Roadmap

### Phase 1: Core Setup & Client-Side Compression

- Install `@supabase/supabase-js` and `react-router-dom`.
- Set up `.env` with Supabase keys and `.env.example`.
- Build native HTML5 Canvas WebP image compressor with 500KB limit (`src/utils/imageCompressor.ts`).
- Update `FileUpload.tsx` with compression metrics badge and preview.

### Phase 2: Booking Form & Database Pipeline

- Connect `AppointmentForm.tsx` to upload compressed image to `tattoo-references` bucket.
- Insert booking record into `public.appointments`.
- Real-time loading states and confirmation card with real Supabase UUID.

### Phase 3: Authentication & Security Guard

- Set up `AuthContext.tsx` listening to Supabase session changes.
- Build `LoginPage.tsx` for studio staff.
- Implement `ProtectedRoute.tsx` to guard administrative views.

### Phase 4: Appointments Dashboard, Detailed Inspector & Status Editor

- Build `AdminDashboard.tsx` with live appointment feed, status filters, and search.
- Build `AppointmentDetailModal.tsx` allowing staff to:
  - Inspect client details with quick WhatsApp/Call/Email links.
  - Preview full-res reference artwork with zoom/download.
  - Reschedule dates and times.
  - Update status (`pending`, `confirmed`, `completed`, `canceled`).
  - Record price estimates, deposit status, and staff internal notes.
- Implement appointment deletion for canceled records.

### Phase 5: Verification & Quality Assurance

- Run `pnpm exec tsc --noEmit` to verify type safety across all views.
- Run `pnpm run build` to confirm production bundling.
- Validate end-to-end user booking -> live appearance in admin dashboard -> detailed edit & status update.

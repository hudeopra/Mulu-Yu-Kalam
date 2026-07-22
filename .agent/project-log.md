# Project History & Engineering Log: Mulu Yu Kalam

This log documents the entire architectural journey, implementation history, technical decisions, and operational instructions for the **Mulu Yu Kalam** project.

---

## 1. Project Overview & Initial Scope

- **Source**: Legacy static website (`static/index.html`) using HTML5, SCSS, Bootstrap, Slick slider, multi-animated counter, and deprecated Firebase client scripts.
- **Goal**:
  - Convert `index.html` into a modern, modular **React + TypeScript** web application.
  - Migrate from Bootstrap and custom SCSS into **Tailwind CSS**.
  - Use **pnpm** for package management and high-performance builds.

---

## 2. Milestones & Historical Trajectory

### Milestone 1: Tooling & Static to React + TS Conversion

- **Stack Selected**:
  - Vite 8 + React 19 + TypeScript 7
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React for modern vector icons
- **Component Decomposition**:
  - `Header.tsx`: Pinned brand logo with responsive desktop/mobile scaling.
  - `HeroBanner.tsx`: Dual-layer "Ink Your Story" typography (solid + glowing outline), 6-item asymmetric tattoo preview grid, artist silhouette, and interactive animated "Portfolio" CTA button.
  - `AboutSection.tsx`: Pinned social links banner, watermark vector graphic, and animated count-up counters (7+ Years, 250+ Tattoos, 148+ Customers) using native `IntersectionObserver`.
  - `GallerySection.tsx`: Responsive asymmetric grid replicating the 14-item SCSS layout across mobile (2 cols), tablet (4 cols), and desktop (6 cols).
  - `ContactSection.tsx` & `Footer.tsx`: Contact information cards, Unalome motif, and brand footer.
- **Status**: Completed and validated with clean TypeScript compilation and production bundle build.

---

### Milestone 2: Form Architecture, Validation & Justification

- **Requirements Introduced**:
  - Remove legacy Firebase dependency from the form.
  - Implement form validation with **React Hook Form (RHF)** and **Zod** schema validation.
  - Add a tattoo reference file upload section.
  - Enforce controlled inputs and visible inline error messages.
- **Architectural Justification (Uncontrolled vs Controlled)**:
  - **Native inputs (`name`, `email`, `number`, `date`, `time`)**: Used RHF `register` (uncontrolled DOM node with ref subscription) to maximize keystroke performance without whole-component re-renders.
  - **Custom inputs (`tattooLocation`, `FileUpload`)**: Used RHF `<Controller>` to bridge custom Tailwind pill buttons and drag-and-drop file inputs into RHF's state engine.
  - **File Storage**: Clarified difference between browser RAM storage (`File` / `Blob` object in memory) vs permanent persistent backend/storage.

---

### Milestone 3: Sub-project Alignment (Landing Page vs Invoicing App)

- **Question**: Should the public marketing site and an existing internal invoice generation project be merged or kept separate?
- **Architectural Decision**: **Keep them separate**.
  - _Security_: The marketing landing page is 100% public (no auth). The invoice generator is an internal, private tool for studio staff.
  - _Performance_: The landing page stays lightweight and SEO-optimized without heavy PDF generation or admin libraries.
  - _Shared Backend_: Both connect to the same **Supabase** instance. When clients book on the landing page, it lands directly in the database where the invoicing app can read it or convert clients into `customers`.

---

### Milestone 4: Supabase Database & Storage Integration

- **Supabase Instance**:
  - Configured via environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in `.env`.
- **Finalized Database Table**: `public.appointments`
  - Columns: `id`, `created_at`, `updated_at`, `tattoo_location`, `name`, `email`, `phone`, `appointment_date`, `appointment_time`, `reference_image_url`, `notes`, `internal_notes`, `estimated_price`, `deposit_status`, `status`.
  - Row Level Security (RLS) policies for `anon` INSERT/SELECT and `authenticated` ALL.
- **Storage Bucket**: `tattoo-references`
  - Type: Public bucket.
  - Storage Policy: Allows both **INSERT** (public client uploads) and **SELECT** (viewing/previewing images) for `anon` and `authenticated`. Allows **UPDATE** and **DELETE** for `authenticated` only.

---

### Milestone 5: 500KB File Limit & Client-Side Image Compression

- **Requirements**:
  - Enforce maximum file limit of 500KB.
  - Automatically optimize and compress images in the browser before network transmission.
- **Solution**:
  - Zero-dependency native HTML5 `<canvas>` compressor (`src/utils/imageCompressor.ts`).
  - Scales image dimensions to max 1600px width/height and encodes to optimized WebP.
  - Dynamically ensures final file size is under 500KB.
  - UI badge displays compression results (e.g. `3.4 MB → 180 KB, 95% smaller`).

---

### Milestone 6: Studio Authentication, Appointments Dashboard & Detailed Inspector

- **Requirements**:
  - Studio staff authentication (Supabase Auth email/password).
  - Route protection for administrative access (`ProtectedRoute.tsx`).
  - Staff login page (`LoginPage.tsx`).
  - Appointments management dashboard (`AdminDashboard.tsx`) with real-time data feed.
  - Detailed appointment inspector modal (`AppointmentDetailModal.tsx`):
    - Inspect client details with quick WhatsApp/Call/Email links.
    - Preview full-res reference artwork with zoom/download.
    - Reschedule date and time.
    - Interactive status toggling (`pending` 🟡, `confirmed` 🟢, `completed` 🔵, `canceled` 🔴).
    - Record price estimates, deposit status, and staff internal notes.
    - Delete canceled records.
- **Architecture**: Client-side routing with `react-router` cleanly separating `/` (public landing), `/login`, and `/admin` (guarded dashboard).

---

### Milestone 7: Client/Device Rate Limiting Guard

- **Requirements**: Guard against spam and DB exhaustion by limiting submissions per device/browser.
- **Solution**:
  - Implemented `src/utils/rateLimiter.ts` using timestamp arrays in `localStorage`.
  - Enforces a strict maximum of **3 submissions per device within a 24-hour window**.
  - Provides a self-purging expiration mechanism and friendly time formatting (`X hours Y minutes remaining`).
  - Integrated into `src/components/AppointmentForm.tsx` before triggering image uploads or database writes.

---

### Milestone 8: Full Appointments Dashboard & Detailed Inspector Modal

- **Components Implemented**:
  - `src/components/admin/AppointmentDetailModal.tsx`:
    - Direct communication links: WhatsApp (`wa.me`), Call (`tel:`), and Email (`mailto:`).
    - Artwork reference viewer with high-res zoom lightbox & download button.
    - Interactive status pills (`pending`, `confirmed`, `completed`, `canceled`) with immediate Supabase update.
    - Session rescheduling (date picker & time slot inputs).
    - Pricing quotes & deposit status (`unpaid`, `partial`, `paid`).
    - Private internal staff notes.
    - Danger zone record deletion with confirmation safeguards.
  - `src/pages/AdminDashboard.tsx`:
    - Real-time Supabase postgres change subscription (`appointments-realtime-feed`) for instant live updates.
    - Dynamic studio metrics cards (Total, Pending Action Needed, Confirmed, Completed).
    - Status filtering tabs with live counters.
    - Search bar filtering by client name, email, phone, and tattoo placement.
    - Sort toggles (Newest first vs Upcoming session date).
    - Desktop table layout and mobile card responsiveness.
  - `src/App.tsx`:
    - Code splitting with `React.lazy` and `Suspense` for administrative pages to keep public landing bundle lean.

---

## 3. Database & Storage Setup Instructions

### SQL Schema (Run in Supabase SQL Editor):

```sql
-- 1. Create the appointments table
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

-- 3. Public visitors (anon) and staff (authenticated) can INSERT appointments
create policy "Public can book appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (true);

-- 4. Allow reading appointments (for booking confirmation & staff dashboard)
create policy "Allow viewing appointments"
  on public.appointments
  for select
  to anon, authenticated
  using (true);

-- 5. Only staff (authenticated) can UPDATE appointments (rescheduling, status, notes, price)
create policy "Staff can update appointments"
  on public.appointments
  for update
  to authenticated
  using (true)
  with check (true);

-- 6. Only staff (authenticated) can DELETE appointments
create policy "Staff can delete appointments"
  on public.appointments
  for delete
  to authenticated
  using (true);
```

### Storage Setup (In Supabase Dashboard):

1. Navigate to **Storage** -> **New Bucket**.
2. Bucket Name: `tattoo-references`.
3. Set **Public Bucket** to **ON**.
4. Configure Policies on `tattoo-references`:
   - **Policy 1: "Public upload and view"**:
     - Operations: Check **INSERT** and **SELECT**
     - Target Roles: `anon` and `authenticated`
     - Definition: `bucket_id = 'tattoo-references'`
   - **Policy 2: "Staff manage and delete"**:
     - Operations: Check **UPDATE** and **DELETE**
     - Target Roles: `authenticated`
     - Definition: `bucket_id = 'tattoo-references'`

### Staff Auth Setup (In Supabase Dashboard):

1. Go to **Authentication** -> **Users** -> Click **Add User** -> **Create User**.
2. Enter your studio staff email & a password.
3. Check **Auto Confirm User: ON**.
4. Click **Create user**.

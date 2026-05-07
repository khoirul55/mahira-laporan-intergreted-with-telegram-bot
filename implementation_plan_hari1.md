# 🚀 Implementation Plan — Hari 1: Setup Fondasi

> **Tanggal**: 28 April 2026  
> **Target**: Project live di Vercel + database siap + UI library terinstall  
> **Estimasi**: 4-5 jam kerja

---

## Step 1: Buat Project Next.js (30 menit)

### 1.1 Init project
```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

### 1.2 Install dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install browser-image-compression
npm install -D @types/node
```

### 1.3 Verifikasi
- [ ] `npm run dev` berjalan tanpa error
- [ ] Buka `localhost:3000` → halaman default Next.js muncul

---

## Step 2: Setup shadcn/ui (20 menit)

### 2.1 Init shadcn
```bash
npx -y shadcn@latest init
```
Pilih:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

### 2.2 Install komponen yang akan dipakai
```bash
npx -y shadcn@latest add button card input label table badge dialog dropdown-menu separator sheet avatar toast tabs textarea select
```

### 2.3 Verifikasi
- [ ] Folder `src/components/ui/` berisi komponen shadcn
- [ ] Import Button di page.tsx → render tanpa error

---

## Step 3: Setup Supabase Project (30 menit)

### 3.1 Buat project di supabase.com
- [ ] Login ke [supabase.com](https://supabase.com)
- [ ] Klik "New Project"
- [ ] Name: `mahira-laporan`
- [ ] Region: **Southeast Asia (Singapore)**
- [ ] Password: catat & simpan aman
- [ ] Tunggu project ready (~2 menit)

### 3.2 Catat credentials
Dari Settings → API:
- [ ] `Project URL` → simpan
- [ ] `anon public key` → simpan
- [ ] `service_role key` → simpan (RAHASIA)

### 3.3 Buat file `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Setup Supabase Client di Next.js (30 menit)

### 4.1 Buat `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4.2 Buat `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  )
}
```

### 4.3 Buat `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Belum login → redirect ke login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Sudah login tapi akses /login → redirect ke beranda
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/beranda'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

### 4.4 Verifikasi
- [ ] `npm run dev` berjalan tanpa error
- [ ] Tidak ada TypeScript error

---

## Step 5: Setup Database Schema (45 menit)

Buka **Supabase Dashboard → SQL Editor** → jalankan SQL berikut satu per satu:

### 5.1 Extensions
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 5.2 Tabel divisions
```sql
CREATE TABLE divisions (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 5.3 Tabel users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'direksi')),
  division_id   INT REFERENCES divisions(id),
  telegram_id   TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create user row saat register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5.4 Tabel absences
```sql
CREATE TABLE absences (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id),
  absence_date  DATE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('sakit', 'cuti', 'dinas_luar', 'lainnya')),
  reason        TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, absence_date)
);
```

### 5.5 Tabel announcements
```sql
CREATE TABLE announcements (
  id                  SERIAL PRIMARY KEY,
  created_by          UUID NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  target_division_id  INT REFERENCES divisions(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE announcement_reads (
  id              SERIAL PRIMARY KEY,
  announcement_id INT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  read_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
```

### 5.6 Enable RLS (semua tabel)
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_division()
RETURNS INT AS $$
  SELECT division_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: semua bisa baca, direksi bisa edit
CREATE POLICY "Users readable by authenticated" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Direksi manage users" ON users
  FOR ALL USING (get_user_role() = 'direksi');

-- Divisions: semua bisa baca
CREATE POLICY "Divisions readable" ON divisions
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Direksi manage divisions" ON divisions
  FOR ALL USING (get_user_role() = 'direksi');

-- Absences
CREATE POLICY "Staff manage own absences" ON absences
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Direksi view all absences" ON absences
  FOR SELECT USING (get_user_role() = 'direksi');

-- Announcements
CREATE POLICY "Read announcements" ON announcements
  FOR SELECT USING (target_division_id IS NULL OR target_division_id = get_user_division() OR get_user_role() = 'direksi');
CREATE POLICY "Direksi create announcements" ON announcements
  FOR INSERT WITH CHECK (get_user_role() = 'direksi');
```

### 5.7 Seed data divisi awal
```sql
INSERT INTO divisions (name, description) VALUES
  ('Operasional', 'Divisi operasional & handling jamaah'),
  ('Marketing', 'Divisi pemasaran & penjualan'),
  ('Keuangan', 'Divisi keuangan & administrasi');
-- Tambah divisi lain sesuai kebutuhan
```

### 5.8 Verifikasi
- [ ] Semua SQL berjalan tanpa error
- [ ] Tabel muncul di Table Editor Supabase
- [ ] RLS enabled (ikon gembok hijau) di semua tabel
- [ ] Data divisi muncul di tabel divisions

---

## Step 6: Buat Halaman Login (45 menit)

### 6.1 Buat `src/app/(auth)/login/page.tsx`

Halaman login sederhana:
- Form email + password
- Tombol login
- Redirect ke beranda setelah berhasil
- Error handling jika gagal

### 6.2 Buat `src/app/(auth)/layout.tsx`

Layout tanpa sidebar — hanya form di tengah layar.

### 6.3 Buat `src/actions/auth.ts`

Server action untuk login & logout menggunakan Supabase Auth.

### 6.4 Buat user pertama (manual di Supabase)

- Supabase Dashboard → Authentication → Users → Add User
- Email: email pimpinan
- Password: password sementara
- Setelah user terbuat → edit di tabel `users`:
  - `role` = `direksi`
  - `full_name` = nama pimpinan
  - `division_id` = NULL (direksi tidak punya divisi)

### 6.5 Verifikasi
- [ ] Halaman login tampil di `localhost:3000/login`
- [ ] Login dengan user pimpinan → redirect ke beranda
- [ ] Akses halaman lain tanpa login → redirect ke login

---

## Step 7: Deploy ke Vercel (20 menit)

### 7.1 Push ke GitHub
```bash
git init
git add .
git commit -m "Initial setup: Next.js + Supabase + shadcn/ui"
git remote add origin https://github.com/[username]/mahira-laporan.git
git push -u origin main
```

### 7.2 Deploy di Vercel
- [ ] Login ke [vercel.com](https://vercel.com)
- [ ] Import repository dari GitHub
- [ ] Set environment variables (copy dari `.env.local`)
- [ ] Deploy

### 7.3 Setup domain (opsional, bisa besok)
- [ ] Di Vercel: Settings → Domains → tambah `laporan.mahiratour.id`
- [ ] Di DNS mahiratour.id: tambah `CNAME laporan → cname.vercel-dns.com`
- [ ] Tunggu propagasi (~5-30 menit)

### 7.4 Verifikasi
- [ ] `https://mahira-laporan.vercel.app` bisa diakses
- [ ] Login berfungsi di production
- [ ] (Opsional) `laporan.mahiratour.id` bisa diakses

---

## Checklist Akhir Hari 1

| # | Item | Status |
|---|---|---|
| 1 | Project Next.js + TypeScript berjalan | ⬜ |
| 2 | shadcn/ui terinstall dengan komponen dasar | ⬜ |
| 3 | Supabase project dibuat (Singapore region) | ⬜ |
| 4 | Supabase client (browser + server) terkonfigurasi | ⬜ |
| 5 | Middleware auth guard berfungsi | ⬜ |
| 6 | Tabel divisions, users, absences, announcements dibuat | ⬜ |
| 7 | RLS policies aktif di semua tabel | ⬜ |
| 8 | Data divisi awal sudah di-seed | ⬜ |
| 9 | Halaman login berfungsi | ⬜ |
| 10 | User direksi pertama bisa login | ⬜ |
| 11 | Project live di Vercel | ⬜ |

---

> [!TIP]
> **Target akhir hari ini**: Buka HP → akses URL → halaman login muncul → login sebagai direksi → berhasil masuk. Itu sudah cukup. Besok lanjut ke CRUD user & divisi + halaman izin.

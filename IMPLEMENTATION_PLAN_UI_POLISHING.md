# UI/UX Polishing: Typography Inter + Dual Light/Dark Mode

**Tanggal**: 23 Mei 2026  
**Project**: Mahira Tour — Sistem Laporan Terintegrasi  
**Estimasi Total**: ~4-5 jam

Melakukan overhaul tampilan visual Mahira Tour agar lebih **segar, nyaman, dan profesional** — terinspirasi dari Linear, Notion, Stripe, dan Vercel. Font diganti dari Geist Sans ke **Inter** untuk readability yang lebih warm. Ditambahkan **dual mode (light default + dark toggle)** agar user bisa pilih sesuai preferensi.

---

## 📋 Keputusan yang Perlu Disetujui

Sebelum mulai implementasi, ada 3 keputusan penting:

### 1. Font Geist → Inter
Semua tampilan akan berubah font. Inter memiliki x-height lebih besar sehingga teks terasa sedikit lebih besar di size yang sama. Inter dipakai oleh **Linear, Notion, GitHub, Figma, Supabase** — lebih warm dan readable untuk user non-tech.

### 2. Default Theme: Light atau Dark?
Saat pertama kali buka, user akan melihat mode apa? **Rekomendasi: Light**, karena staff pakai di jam kerja siang hari. Dark mode tetap tersedia via toggle.

### 3. Input/Button Height 36px → 40px
Dinaikkan agar lebih nyaman di-tap di mobile. Ini akan sedikit mengubah spacing form yang sudah ada.

---

## 🏗️ Proposed Changes

### Fase 1 — Font Migration (Geist → Inter)

**File**: `src/app/layout.tsx`

Perubahan:
- Hapus import `Geist` dan `Geist_Mono`
- Tambah import `Inter` dan `JetBrains_Mono` dari `next/font/google`
- Update CSS variables: `--font-geist-sans` → `--font-inter`, `--font-geist-mono` → `--font-mono`
- Hapus hardcoded class `dark` dari `<html>` (akan dikelola oleh `next-themes`)
- Wrap children dengan `<ThemeProvider>` dari `next-themes`

```tsx
// Sebelum
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Sesudah
import { Inter, JetBrains_Mono } from "next/font/google";
const inter = Inter({ 
  variable: "--font-inter", 
  subsets: ["latin"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
```

---

### Fase 2 — Typography Scale & CSS Variables

**File**: `src/app/globals.css`

#### 2a. Update @theme inline

```css
--font-sans: var(--font-inter);
--font-mono: var(--font-mono);
```

#### 2b. Tambah Light Mode Variables

```css
:root {
  /* Light Mode — Warm Earth Tone */
  --background: #FAFAF8;         /* warm off-white, bukan pure #FFF */
  --foreground: #1A1917;         /* warm black text */
  --card: #FFFFFF;
  --card-foreground: #1A1917;
  --popover: #FFFFFF;
  --popover-foreground: #1A1917;
  --primary: #10b981;            /* emerald tetap sama */
  --primary-foreground: #FFFFFF;
  --secondary: #F0EFED;
  --secondary-foreground: #4A4640;
  --muted: #F5F4F2;
  --muted-foreground: #6B6560;
  --accent: #F0EFED;
  --accent-foreground: #1A1917;
  --destructive: #DC2626;
  --border: #E8E5E0;             /* warm beige border */
  --input: #F5F4F2;
  --ring: #10b981;
  --radius: 0.5rem;              /* 8px — sedikit lebih bulat */
  
  /* Sidebar Light */
  --sidebar: #FFFFFF;
  --sidebar-foreground: #6B6560;
  --sidebar-primary: #10b981;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F5F4F2;
  --sidebar-accent-foreground: #1A1917;
  --sidebar-border: #E8E5E0;
  --sidebar-ring: #10b981;
}

/* Dark mode — yang sudah ada, dipindah ke .dark saja */
.dark {
  --background: #111110;
  --foreground: #e8e6e3;
  --card: #1a1917;
  --card-foreground: #e8e6e3;
  --popover: #1f1e1b;
  --popover-foreground: #e8e6e3;
  --primary: #10b981;
  --primary-foreground: #0a0a09;
  --secondary: #242220;
  --secondary-foreground: #b5b3af;
  --muted: #1e1d1a;
  --muted-foreground: #737068;
  --accent: #242220;
  --accent-foreground: #e8e6e3;
  --destructive: #e05252;
  --border: #272522;
  --input: #1e1d1a;
  --ring: #10b981;
  --radius: 0.375rem;
  --sidebar: #111110;
  --sidebar-foreground: #a8a49e;
  --sidebar-primary: #10b981;
  --sidebar-primary-foreground: #0a0a09;
  --sidebar-accent: #1e1d1a;
  --sidebar-accent-foreground: #e8e6e3;
  --sidebar-border: #1e1d1a;
  --sidebar-ring: #10b981;
}
```

#### 2c. Typography Scale Baru

Terinspirasi: **Linear** (tight labels) + **Notion** (readable body) + **Stripe** (polished hierarchy)

```css
.text-display {
  font-size: 1.5rem;        /* 24px — untuk judul halaman besar */
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--foreground);
}

.text-page-title {
  font-size: 1.125rem;      /* 18px — NAIK dari 16px */
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--foreground);
}

.text-section-head {
  font-size: 0.9375rem;     /* 15px — baru */
  font-weight: 600;
  line-height: 1.4;
  color: var(--foreground);
}

.text-section-label {
  font-size: 0.75rem;       /* 12px — NAIK dari 11px */
  font-weight: 500;
  color: var(--muted-foreground);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.text-body {
  font-size: 0.875rem;      /* 14px — TETAP */
  color: var(--muted-foreground);
  line-height: 1.6;
}

.text-body-medium {
  font-size: 0.875rem;      /* 14px — baru, untuk label/nama */
  font-weight: 500;
  line-height: 1.6;
  color: var(--foreground);
}

.text-caption {
  font-size: 0.8125rem;     /* 13px — baru */
  color: var(--muted-foreground);
  line-height: 1.5;
}

.text-data {
  font-size: 0.875rem;      /* 14px — TETAP */
  font-weight: 500;
  color: var(--foreground);
  font-feature-settings: "tnum" 1; /* tabular numbers untuk tabel */
}

.text-meta {
  font-size: 0.6875rem;     /* 11px — TETAP */
  color: var(--muted-foreground);
}

.text-stat-large {
  font-size: 1.75rem;       /* 28px — baru, untuk angka besar */
  font-weight: 700;
  line-height: 1;
  font-feature-settings: "tnum" 1;
  color: var(--foreground);
}
```

#### 2d. Update font-feature-settings body

```css
body {
  font-feature-settings: "cv01" 1, "cv02" 1, "cv03" 1, "cv04" 1, "tnum" 1, "ss01" 1, "case" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Fitur OpenType Inter yang aktif:
- `cv01-cv04`: Alternatif karakter 1, 4, 6, 9, I yang lebih jelas
- `tnum`: Angka tabular (sejajar di tabel/kolom)
- `ss01`: Stylistic set alternatif
- `case`: Punctuation yang sesuai case

#### 2e. Migrasi hardcoded hex di custom classes

Semua hex colors di `.text-*`, `.nav-item`, `.badge-*`, `.input-clean`, `.btn-*`, `.surface-hover` diganti ke `var(--foreground)`, `var(--muted-foreground)`, `var(--border)`, dll.

#### 2f. Update form element heights

```css
.input-clean { height: 2.5rem; }    /* 40px — NAIK dari 36px */
.btn-primary { height: 2.5rem; }    /* 40px — NAIK dari 36px */
.btn-ghost { height: 2.25rem; }     /* 36px — TETAP untuk secondary */
```

#### 2g. Tambah shadow di light mode

```css
.surface {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
}

:is(.dark) .surface {
  box-shadow: none; /* dark mode tanpa shadow, pakai border saja */
}
```

---

### Fase 3 — Theme Provider & Toggle Component

#### [NEW] `src/components/theme-provider.tsx`

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
```

#### [NEW] `src/components/theme-toggle.tsx`

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" /> // placeholder

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 rounded-lg flex items-center justify-center
                 text-muted-foreground hover:text-foreground hover:bg-muted
                 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
```

---

### Fase 4 — Migrasi Hardcoded Colors di Komponen

Semua class `slate-*` dan hardcoded hex diganti ke semantic tokens.

#### Mapping Referensi Cepat

| Hardcoded Slate | → Semantic Replacement |
|-----------------|------------------------|
| `bg-slate-900` | `bg-card` |
| `bg-slate-900/50` | `bg-card/50` |
| `bg-slate-950` | `bg-input` atau `bg-background` |
| `border-slate-800` | `border-border` |
| `border-slate-700` | `border-border` |
| `text-slate-200` | `text-foreground` |
| `text-slate-300` | `text-foreground/80` |
| `text-slate-400` | `text-muted-foreground` |
| `text-slate-500` | `text-muted-foreground/70` |
| `text-white` | `text-foreground` |
| `hover:bg-slate-900/20` | `hover:bg-muted` |
| `hover:text-white` | `hover:text-foreground` |
| `bg-slate-800 text-slate-300` | `bg-secondary text-secondary-foreground` |

#### Halaman Direksi (~13 file, perubahan terbanyak)

| # | File | Jumlah Perubahan |
|---|------|------------------|
| 1 | `src/app/(direksi)/dashboard/page.tsx` | ~6 instances |
| 2 | `src/app/(direksi)/dashboard/users/page.tsx` | ~15 instances |
| 3 | `src/app/(direksi)/dashboard/users/user-dialogs.tsx` | ~20 instances |
| 4 | `src/app/(direksi)/dashboard/pengumuman/page.tsx` | ~10 instances |
| 5 | `src/app/(direksi)/dashboard/pengumuman/announcement-form.tsx` | ~8 instances |
| 6 | `src/app/(direksi)/dashboard/laporan/page.tsx` | ~10 instances |
| 7 | `src/app/(direksi)/dashboard/laporan/[id]/page.tsx` | ~8 instances |
| 8 | `src/app/(direksi)/dashboard/laporan/[id]/feedback-form.tsx` | ~6 instances |
| 9 | `src/app/(direksi)/dashboard/divisions/page.tsx` | ~8 instances |
| 10 | `src/app/(direksi)/dashboard/divisions/division-dialogs.tsx` | ~8 instances |
| 11 | `src/app/(direksi)/dashboard/absences/page.tsx` | ~8 instances |
| 12 | `src/app/(direksi)/dashboard/arsip/filter-client.tsx` | ~4 instances |
| 13 | `src/app/(direksi)/dashboard/loading.tsx` | ~3 instances |

#### Halaman Auth (~2 file)

| # | File | Perubahan |
|---|------|-----------|
| 1 | `src/app/(auth)/layout.tsx` | Hapus inline style `backgroundColor: '#111110'` → `bg-background` |
| 2 | `src/app/(auth)/login/page.tsx` | Migrasi SEMUA `style={{}}` ke Tailwind classes |

#### Halaman Staff (~6 file, minor cleanup)

| # | File | Perubahan |
|---|------|-----------|
| 1 | `src/app/(staff)/beranda/laporan/page.tsx` | Minor `slate-*` cleanup |
| 2 | `src/app/(staff)/beranda/laporan/report-forms.tsx` | Minor `slate-*` cleanup |
| 3 | `src/app/(staff)/beranda/izin/page.tsx` | Minor cleanup |
| 4 | `src/app/(staff)/beranda/izin/izin-form.tsx` | Minor cleanup |
| 5 | `src/app/(staff)/beranda/loading.tsx` | Minor cleanup |
| 6 | `src/app/(staff)/beranda/logout-button.tsx` | Minor cleanup |

#### shadcn/ui Components (~6 file)

| # | File | Perubahan |
|---|------|-----------|
| 1 | `src/components/ui/empty-state.tsx` | `slate-*` → semantic |
| 2 | `src/components/ui/dialog.tsx` | Review `slate-*` |
| 3 | `src/components/ui/sheet.tsx` | Review `slate-*` |
| 4 | `src/components/ui/button.tsx` | Review `slate-*` |
| 5 | `src/components/search-bar.tsx` | `slate-*` → semantic |
| 6 | `src/components/file-list.tsx` | `slate-*` → semantic |

---

### Fase 5 — Integrasi ThemeToggle di Layout

#### [MODIFY] `src/app/(direksi)/layout.tsx`
- Tambah `<ThemeToggle />` di sidebar header (desktop) — sebelah logo Mahira Tour
- Tambah `<ThemeToggle />` di mobile header — sebelah hamburger menu

#### [MODIFY] `src/app/(staff)/layout.tsx`
- Tambah `<ThemeToggle />` — bisa di halaman profil atau di header beranda

---

## ⏱️ Estimasi Effort Per Fase

| Fase | Task | Estimasi |
|------|------|----------|
| 1 | Font migration (layout.tsx) | 10 menit |
| 2 | Typography scale + CSS variables (globals.css) | 30 menit |
| 3 | ThemeProvider + ThemeToggle (2 file baru) | 15 menit |
| 4 | Migrasi hardcoded colors (~30 file) | 2-3 jam |
| 5 | Integrasi toggle di layouts | 15 menit |
| — | Build test + visual verification | 30 menit |
| **Total** | | **~4-5 jam** |

---

## ✅ Verification Plan

### Build Test
```bash
npm run build
```
Harus sukses 100% tanpa error TypeScript maupun kompilasi.

### Manual Verification Checklist

#### Light Mode
- [ ] Background warm off-white (`#FAFAF8`), bukan pure white
- [ ] Text terbaca jelas, kontras memenuhi WCAG AA
- [ ] Card memiliki subtle shadow
- [ ] Badges tetap berwarna sesuai semantic (emerald, amber, red)
- [ ] Form inputs terlihat jelas dengan border

#### Dark Mode (toggle)
- [ ] Sama persis seperti tampilan sebelum perubahan
- [ ] Tidak ada elemen yang "bocor" warna light
- [ ] Transisi smooth tanpa flash

#### Mobile (375px — iPhone SE)
- [ ] Font Inter terbaca jelas di size kecil (13-14px)
- [ ] Button/input height 40px nyaman di-tap
- [ ] Bottom nav & ThemeToggle berfungsi

#### Desktop (1920px)
- [ ] Sidebar + ThemeToggle berfungsi
- [ ] Typography hierarchy terlihat jelas
- [ ] Tabel dan data menggunakan tabular numbers

#### Persistence
- [ ] Refresh halaman → preferensi tema tetap tersimpan
- [ ] Buka tab baru → tema mengikuti

---

## 📝 Catatan Teknis

1. **`next-themes` sudah terinstall** di `package.json` (`"next-themes": "^0.4.6"`). Tidak perlu install tambahan.
2. **Semua komponen sudah pakai CSS variables** — sehingga saat toggle dark/light, perubahan otomatis tanpa edit komponen.
3. **Yang membutuhkan migrasi manual** hanya elemen yang menggunakan hardcoded `slate-*` class atau inline `style={{}}`.
4. **Tidak ada breaking change** — semua URL, API, dan logic bisnis tetap sama. Hanya tampilan yang berubah.

---

*Dokumen ini akan di-update seiring progres implementasi.*

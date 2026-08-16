# Mahira Laporan (Integrated with Telegram Bot)

Mahira Laporan adalah sistem pelaporan kinerja dan manajemen kepegawaian internal berbasis web yang terintegrasi dengan Telegram Bot dan kecerdasan buatan (AI). Aplikasi ini dirancang untuk memudahkan proses pelaporan tugas, manajemen absensi/izin, dan komunikasi internal (pengumuman) dengan alur kerja yang terstruktur berdasarkan peran (Role-based Access Control).

## 🌟 Fitur Utama

### 1. Role-based Access Control (RBAC)
Sistem memiliki dua peran utama dengan akses yang disesuaikan:
- **Direksi (Admin):** Memiliki akses penuh ke *Dashboard* untuk memantau laporan, menyetujui izin, mengelola pengguna dan divisi, melihat analitik kinerja, serta membuat pengumuman.
- **Staff:** Memiliki akses ke *Beranda* untuk membuat laporan harian & bulanan, mengajukan izin, melihat riwayat kinerja pribadi, dan mengakses pengumuman dari direksi.

### 2. Manajemen Laporan (Harian & Bulanan)
- Staff dapat dengan mudah mengisi form laporan kinerja (harian maupun bulanan).
- Direksi dapat memantau, memeriksa, dan mengarsipkan laporan-laporan tersebut.
- **AI Feedback:** Dilengkapi dengan integrasi Google Gemini AI untuk memberikan ringkasan atau umpan balik otomatis pada laporan yang dikirimkan.

### 3. Pengelolaan Absensi & Izin
- Staff dapat mengajukan permohonan izin/cuti melalui sistem.
- Direksi dapat menyetujui, menolak, dan merekapitulasi data absensi secara real-time.

### 4. Integrasi Telegram Bot
Sistem ini terhubung langsung dengan Telegram untuk memberikan kemudahan akses informasi secara instan:
- **Notifikasi Real-time:** Notifikasi pengumuman, persetujuan izin, dan status laporan.
- **Reminders:** Pengingat otomatis (reminder) bagi staff untuk mengisi laporan.
- **Weekly Digest:** Rangkuman kinerja mingguan yang dikirimkan otomatis melalui bot.

### 5. Pengumuman & Arsip
- Direksi dapat menyiarkan pengumuman penting yang langsung dapat dilihat oleh seluruh staff.
- Fitur arsip (arsip laporan dan dokumen) untuk menyimpan data lama agar tetap rapi dan mudah dicari.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan *stack* teknologi modern untuk memastikan performa yang cepat, aman, dan mudah dikembangkan:
- **Framework:** [Next.js](https://nextjs.org/) (App Router) dengan React 19
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Authentication)
- **AI Integration:** Google Gemini API
- **Testing:** Playwright (E2E Testing)

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### Prasyarat
- Node.js (versi 20 atau terbaru disarankan)
- Akun Supabase (untuk database dan otentikasi)
- Token API Telegram Bot
- API Key Google Gemini

### Instalasi & Menjalankan

1. **Clone repository ini**
   ```bash
   git clone https://github.com/khoirul55/mahira-laporan-intergreted-with-telegram-bot.git
   cd mahira-laporan-intergreted-with-telegram-bot
   ```

2. **Install dependensi**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Atur Environment Variables**
   Buat file `.env` atau `.env.local` di *root* direktori dan sesuaikan variabel yang dibutuhkan (seperti Supabase URL, Supabase Anon Key, Telegram Bot Token, Gemini API Key, dll).

4. **Jalankan Development Server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Akses Aplikasi**
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📄 Lisensi
Hak cipta © Mahira Tour. Segala bentuk distribusi dan penggunaan kode diatur oleh kebijakan internal perusahaan.

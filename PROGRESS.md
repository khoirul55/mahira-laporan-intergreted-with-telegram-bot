# 📊 Laporan Progress Sistem Mahira Tour (Update: Akhir Hari 3)

Dokumen ini melacak apa saja yang sudah berhasil dibangun dan apa yang harus dilanjutkan pada sesi pengembangan berikutnya. Sangat berguna untuk memberikan konteks instan kepada Developer atau AI Assistant di sesi yang baru.

## ✅ FITUR YANG SUDAH SELESAI (100% Online di Vercel)

1.  **Fondasi Sistem & Keamanan**
    *   Setup Next.js 16 (App Router) & TailwindCSS (Shadcn/UI).
    *   Integrasi database Supabase PostgreSQL.
    *   Sistem *Row Level Security* (RLS) diaktifkan untuk keamanan data.
2.  **Otentikasi & Akses Kontrol**
    *   Login menggunakan sistem Auth Supabase.
    *   Middleware *Auth Guard* (Pemisahan akses `/dashboard` untuk Direksi dan `/beranda` untuk Staff).
3.  **Manajemen Perusahaan (Dashboard Pimpinan)**
    *   **CRUD Divisi**: Tambah, edit, hapus divisi.
    *   **CRUD Staff**: Pimpinan bisa mendaftarkan akun staff baru, mengubah divisi, role, dan menonaktifkan akun.
    *   **Overview Dashboard**: Menampilkan statistik *real-time*.
4.  **Sistem Absensi / Izin**
    *   Staff bisa mengajukan izin (Sakit, Cuti, Dinas Luar).
    *   Pimpinan memiliki halaman *Rekap Izin* untuk memantau semua status.
5.  **CORE: Laporan Harian (Logika Kompleks)**
    *   *Skenario Pagi*: Staff menginput Rencana Kerja.
    *   *Skenario Sore*: Staff mengubah status tugas dan mensubmit laporan.
    *   *Sistem Kunci & Proteksi Izin*: Terkunci otomatis setelah disubmit atau jika sedang cuti/sakit.
    *   *Pemantauan Direksi*: Halaman "Pantau Laporan" di mana pimpinan bisa melihat status setiap staff.
    *   **Detail Laporan & Feedback**: Direksi bisa membaca detail laporan spesifik dan meninggalkan kolom catatan/feedback, yang akan tampil di halaman staff.
    *   **Upload Bukti Foto**: Staff dapat mengunggah foto bukti kerja ke Supabase Storage (`report_evidences`) saat mensubmit laporan, dan foto tersebut dapat dilihat oleh Direksi.
6.  **Komunikasi Internal**
    *   **Papan Pengumuman**: Pimpinan bisa membuat pengumuman *broadcast* yang langsung terlihat di halaman Beranda Staff.
7.  **UX / UI Polishing**
    *   Transisi halaman yang mulus menggunakan komponen `loading.tsx` (Spinner).
    *   Penggunaan *badge* warna-warni untuk membedakan prioritas tugas dan status laporan.

---

## 🚀 FITUR YANG BELUM SELESAI (Target Hari 4)

Fitur-fitur ini adalah pelengkap sistem yang harus diprioritaskan di sesi berikutnya:

1.  **Arsip Dokumen Divisi**
    *   *Storage/Cloud* internal untuk divisi mengunggah/mendownload file (PDF/Excel/Word).
    *   Direksi bisa melihat arsip semua divisi.
2.  **Pencarian (Search & Filter)**
    *   Fitur untuk mencari arsip atau riwayat laporan bulan-bulan sebelumnya berdasarkan tanggal/nama/status.
3.  **Integrasi Telegram Bot**
    *   Mengirim *Reminder* otomatis jam 16:00 bagi staff yang laporannya masih *draft* atau belum buat rencana.
    *   *Weekly Digest* laporan ke grup/pimpinan.

---
*Dokumen ini harus dibaca oleh AI di awal sesi (besok) agar bisa langsung melanjutkan ke daftar **YANG BELUM SELESAI**.*

# 📊 Laporan Progress Sistem Mahira Tour (Update: Akhir Hari 2)

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
    *   **CRUD Divisi**: Tambah, edit, hapus divisi (dengan proteksi agar divisi yang memiliki staff tidak bisa dihapus).
    *   **CRUD Staff**: Pimpinan bisa mendaftarkan akun staff baru, mengubah divisi, role, dan menonaktifkan akun.
    *   **Overview Dashboard**: Menampilkan statistik *real-time* (Total Staff, Laporan Masuk, Izin Hari Ini).
4.  **Sistem Absensi / Izin**
    *   Staff bisa mengajukan izin (Sakit, Cuti, Dinas Luar).
    *   Pimpinan memiliki halaman *Rekap Izin* untuk memantau semua status.
5.  **CORE: Laporan Harian (Logika Kompleks)**
    *   *Skenario Pagi*: Staff menginput Rencana Kerja (bisa tambah/hapus tugas dinamis).
    *   *Skenario Sore*: Staff mengubah status tugas (Selesai, Tidak Selesai, dll), memberi catatan, dan mensubmit laporan.
    *   *Sistem Kunci*: Laporan yang sudah disubmit akan terkunci otomatis.
    *   *Proteksi Izin*: Jika staff izin cuti/sakit, form laporan otomatis dimatikan.
    *   *Pemantauan Direksi*: Halaman "Pantau Laporan" di mana pimpinan bisa melihat status setiap staff (Belum Rencana, Izin, Draft, Sudah Submit).
6.  **UX / UI Polishing**
    *   Transisi halaman yang mulus menggunakan komponen `loading.tsx` (Spinner).
    *   Penggunaan *badge* warna-warni untuk membedakan prioritas tugas dan status laporan.

---

## 🚀 FITUR YANG BELUM SELESAI (Target Hari 3 & 4)

Fitur-fitur ini adalah pelengkap sistem yang harus diprioritaskan di sesi berikutnya:

1.  **Arsip Dokumen Divisi**
    *   *Storage/Cloud* internal untuk divisi mengunggah/mendownload file (PDF/Excel).
    *   Direksi bisa melihat arsip semua divisi.
2.  **Papan Pengumuman**
    *   Pimpinan bisa menulis pengumuman (Teks/Broadcast) yang akan muncul di Beranda Staff.
3.  **Integrasi Telegram Bot**
    *   Mengirim *Reminder* otomatis jam 16:00 bagi staff yang laporannya masih *draft* atau belum buat rencana.
    *   *Weekly Digest* laporan ke grup/pimpinan.
4.  **Detail Laporan & Feedback Pimpinan**
    *   Fitur di mana pimpinan bisa mengklik nama staff di "Pantau Laporan" dan membaca detail laporannya secara spesifik, lalu meninggalkan kolom catatan/feedback.
5.  **Pencarian (Search & Filter)**
    *   Fitur untuk mencari arsip atau riwayat laporan bulan-bulan sebelumnya.
6.  **Upload Bukti Foto**
    *   Menambahkan tombol unggah gambar/bukti di form Laporan Harian.

---
*Dokumen ini harus dibaca oleh AI di awal sesi (besok) agar bisa langsung melanjutkan ke daftar **YANG BELUM SELESAI**.*

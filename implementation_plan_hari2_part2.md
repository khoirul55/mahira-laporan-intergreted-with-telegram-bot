# 🚀 Implementation Plan Hari 2 (Part 2) — Laporan Harian

**Waktu Tersisa:** ~1.5 Jam (Target selesai sebelum 16:00)
**Fokus Utama:** Membangun jantung utama aplikasi, yaitu Sistem Laporan Harian untuk Staff. 

Mengingat waktu yang terbatas, kita akan memprioritaskan fitur-fitur fundamental (Backend dan Input Staff) agar logika utama berjalan sempurna. Untuk fitur pelaporan di sisi Pimpinan (Direksi) akan kita kerjakan jika waktu bersisa, atau diprioritaskan untuk Hari 3.

---

## 🎯 Prioritas 1: Fondasi Backend (Estimasi 30 Menit)
*Target: Membuat "mesin" untuk memproses rencana kerja dan laporan.*

1. **Membuat File Server Actions (`src/actions/report.ts`)**
   - **`createDailyPlan`**: Menerima daftar tugas dari staff di pagi hari. Sistem akan otomatis menyimpan ke tabel `daily_work_plans`, `plan_tasks`, sekaligus membuat kerangka laporan kosong (draft) di `daily_reports`.
   - **`updateTaskStatus`**: Menyimpan perubahan yang dilakukan staff di sore hari (misal: mengubah status task menjadi 'selesai', menambah catatan `notes`).
   - **`submitDailyReport`**: Fungsi pamungkas untuk mengubah status laporan menjadi `submitted` (mengunci laporan).

---

## 🎯 Prioritas 2: Halaman Laporan Staff (Estimasi 45-60 Menit)
*Target: Tampilan Antarmuka (UI) interaktif untuk staff mengisi rencana dan laporan.*

1. **Membangun Layout Halaman (`src/app/(staff)/beranda/laporan/page.tsx`)**
   - Membuat logika *Routing Dinamis* yang sudah kita diskusikan (Mengecek status: Apakah hari ini izin? Apakah ada laporan menggantung? Apakah sudah buat rencana?).
2. **Membuat Komponen Form "Pagi Hari" (Buat Rencana)**
   - Form input tugas dinamis (staff bisa klik tombol `+ Tambah Tugas` untuk menambah baris input baru tanpa batas).
   - Memilih prioritas tugas (Tinggi, Sedang, Rendah).
3. **Membuat Komponen Form "Sore Hari" (Update Laporan)**
   - Menampilkan tabel tugas yang dibuat tadi pagi.
   - Mengubah status menggunakan Dropdown cantik (Selesai ✅, Dalam Proses 🔄, Tidak Selesai ❌).
   - Tombol "Submit Laporan Akhir".

---

## 🎯 Prioritas 3: Pemantauan Pimpinan (Opsional - Jika Waktu Cukup)
*Target: Pimpinan bisa melihat siapa saja yang sudah mengumpulkan laporan hari ini.*

1. **Halaman Rekap Laporan Direksi (`src/app/(direksi)/dashboard/laporan/page.tsx`)**
   - Menampilkan tabel seluruh staff Mahira Tour.
   - Kolom Status menampilkan secara *Real-time*: `Sudah Submit`, `Draft (Baru buat rencana)`, `Belum ada plan`, atau `Izin`.

> **💡 Catatan Eksekusi:**
> Dengan waktu 1.5 jam, **Prioritas 1 dan 2 sangat realistis untuk diselesaikan**. Prioritas 3 bisa dikerjakan dengan cepat jika tidak ada error teknis yang menghambat, atau bisa dialihkan dengan tenang ke "Hari 3" besok.

# 📝 Implementation Plan Hari ke-3: Sistem Laporan Terintegrasi Mahira Tour

Selamat pagi! Berdasarkan **PROGRESS.md** kita yang sudah merekam pencapaian di Hari 1 dan Hari 2, fondasi utama sistem pelaporan sudah berhasil berjalan dengan baik (Otentikasi, CRUD User/Divisi, Sistem Izin, dan Siklus Laporan Harian). 

Untuk **Hari ke-3** ini, kita akan fokus pada pengembangan fitur kolaboratif dan detail fungsional untuk memperkaya interaksi antara Pimpinan (Direksi) dan Staff.

Berikut adalah rencana implementasi langkah demi langkah untuk hari ini:

## 🎯 Fase 1: Detail Laporan & Feedback Pimpinan
Saat ini pimpinan sudah bisa memantau status laporan staff di halaman "Pantau Laporan", namun belum bisa melihat isi detail dan memberikan feedback.

*   **Tugas 1.1:** Membuat halaman detail laporan di sisi Direksi (contoh route: `/dashboard/reports/[id]`).
*   **Tugas 1.2:** Menampilkan rincian tugas yang direncanakan pagi hari beserta status penyelesaian dan catatan staf di sore hari.
*   **Tugas 1.3:** Menambahkan form "Komentar/Feedback Pimpinan" pada laporan tersebut.
*   **Tugas 1.4:** (Sisi Staff) Menampilkan feedback pimpinan tersebut di riwayat laporan staff pada halaman beranda mereka.

## 📢 Fase 2: Papan Pengumuman (Broadcast Pimpinan)
Membangun sistem komunikasi satu arah dari direksi ke seluruh staff.

*   **Tugas 2.1:** Membuat tabel `announcements` di Supabase (judul, konten, tanggal, pembuat).
*   **Tugas 2.2:** Membuat halaman kelola pengumuman di Dashboard Pimpinan (CRUD Pengumuman).
*   **Tugas 2.3:** Menampilkan *widget* Papan Pengumuman di halaman Beranda Staff agar informasi penting dapat langsung terlihat saat mereka login.

## 📸 Fase 3: Sistem Upload Bukti Foto Laporan
Memperkuat validitas laporan harian dengan bukti visual.

*   **Tugas 3.1:** Setup *Supabase Storage* (Bucket `report_evidences`) dan mengatur *Policies* (RLS) agar staff bisa upload gambar.
*   **Tugas 3.2:** Menambahkan komponen *Image Uploader* pada form "Submit Laporan Sore" di sisi Staff.
*   **Tugas 3.3:** Menampilkan thumbnail gambar bukti tersebut di halaman Detail Laporan (yang dibangun pada Fase 1) agar pimpinan dapat melihatnya.

---

### 🚦 Bagaimana kita akan mulai?
Saya menyarankan kita mulai dari **Fase 1: Detail Laporan & Feedback Pimpinan** terlebih dahulu karena ini adalah pelengkap krusial dari fitur Laporan Harian yang sudah kita buat kemarin.

Apakah Anda setuju dengan rencana ini, atau ada fitur spesifik dari *PROGRESS.md* (seperti Arsip Divisi atau Pencarian) yang ingin diprioritaskan lebih dulu hari ini?

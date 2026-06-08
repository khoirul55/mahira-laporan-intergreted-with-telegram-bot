# Panduan Testing Manual Lengkap (End-to-End Flow)
**Project**: Mahira Tour Reporting System
**Target**: Production (Vercel)
**Perangkat**: Laptop (Desktop) & Smartphone (Mobile)

Skenario ini dirancang untuk menguji **Alur Bisnis Penuh (End-to-End)** dari awal staf bekerja di pagi hari, hingga direksi mereview laporan di sore hari, sembari memeriksa kenyamanan UI/UX.

---

## 🔑 Persiapan (Preparation)
1. **URL Production**: `https://mahira-laporan-intergreted-with-tel.vercel.app`
2. **Kredensial Akun**: Siapkan minimal 2 akun untuk saling berinteraksi:
   - Akun **Staff** (email & password)
   - Akun **Direksi** (email & password)

---

## 🏃‍♂️ Skenario 1: Flow Keseharian Staff (Pagi - Sore)
*Tujuan: Memastikan alur kerja harian staff berjalan lancar.*

1. **Login & Pengecekan Awal**
   - Login sebagai Staff.
   - Perhatikan halaman **Beranda**. Cek apakah ada pengumuman baru yang masuk dari Direksi.
   - *Cek UI*: Tes klik tombol Dark/Light mode, pastikan warna tidak menyakiti mata.
2. **Skenario Pagi: Input Rencana Kerja**
   - Masuk ke menu **Laporan**.
   - Isi form rencana kerja untuk hari ini. Simpan sebagai **Draft** (belum di-submit).
   - *Cek UI (Mobile)*: Pastikan saat mengetik di HP, form tidak tertutup *keyboard* dan tombol tetap bisa diklik.
3. **Skenario Sore: Update Status & Submit**
   - Buka kembali Laporan hari ini yang berstatus Draft.
   - Ubah status tugas menjadi Selesai/Tertunda, isi keterangan hasil, dan **upload foto bukti**.
   - Klik **Submit Laporan**.
   - *Cek Flow*: Sistem harus mengunci form (tidak bisa diedit lagi). Jika Telegram terhubung, notifikasi akan terkirim ke Direksi.
4. **Skenario Akhir Bulan: Laporan Bulanan dengan AI**
   - Masuk ke **Laporan Bulanan**.
   - Klik tombol ✨ **Generate AI** untuk membuat draf *Pencapaian Utama* & *Tantangan*.
   - *Cek Flow*: Pastikan AI berhasil membuatkan narasi teks otomatis. Submit laporan bulanan.

---

## 👔 Skenario 2: Flow Pengawasan Direksi
*Tujuan: Memastikan Direktur dapat memantau, memberi evaluasi, dan mengelola perusahaan.*

1. **Pantau Kinerja (Real-time)**
   - Login menggunakan akun Direksi.
   - Di **Dashboard Overview**, perhatikan apakah statistik "Laporan Masuk" sudah bertambah sesuai submit dari skenario 1.
2. **Review & AI Feedback**
   - Masuk ke **Pantau Laporan**, buka laporan staff yang baru disubmit di skenario 1.
   - Baca detail laporannya.
   - Coba fitur ✨ **AI Feedback Suggestion** untuk men-generate otomatis kata-kata evaluasi/semangat.
   - Simpan Feedback.
3. **Komunikasi Perusahaan**
   - Masuk ke menu **Pengumuman**.
   - Buat pengumuman baru (misal: "Meeting Evaluasi Mingguan").
   - *Cek Flow*: Pengumuman ini harus muncul di beranda akun Staff.
4. **Arsip & Pin Dokumen**
   - Buka menu **Arsip** Divisi.
   - Klik icon 📌 (Pin) pada salah satu dokumen penting.
   - *Cek UI*: Pastikan dokumen tersebut naik ke urutan paling atas dan mendapat border khusus warna emerald.

---

## 📱 Skenario 3: Pengecekan Khusus (Edge Cases)

1. **Tampilan Tabel di HP (Mobile View)**
   - Login menggunakan HP. Buka halaman **Riwayat Laporan** atau **Rekap Izin**.
   - *Cek UI*: Pastikan tabel panjang **berubah menjadi tampilan Kartu (Card)** yang ditumpuk ke bawah, bukan memanjang horizontal.
2. **Alur Izin (Absen)**
   - Login akun Staff, ajukan **Izin (Sakit/Cuti)**.
   - *Cek Flow*: Pastikan setelah form izin di-submit, form Laporan Harian otomatis **terkunci** untuk hari itu.
3. **Pengecekan Telegram Bot**
   - Buka profil Staff di web, copy perintah `/start <kode>`
   - Buka Telegram `@mahiratour_bot`, paste perintah tersebut.
   - Ketik `/status` di bot. Pastikan bot menjawab status laporan Anda hari ini dengan akurat.

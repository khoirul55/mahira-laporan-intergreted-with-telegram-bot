# 🧪 Skenario Testing Manual Tahap 1 (End-to-End)
**Sistem Laporan Terintegrasi Mahira Tour**

Dokumen ini adalah panduan pengujian alur kerja *(workflow)* utama aplikasi menggunakan dua akun nyata yang sudah Anda miliki:
1. **Akun Direksi**: Khilal Hamdan (`khilal@gmail.com`)
2. **Akun Staff**: Khoirul Gunawan (`khoirulgunawan55@gmail.com`) - Divisi: IT

Tujuan dari *testing* ini adalah untuk memastikan seluruh logika mulai dari login, pembuatan pengumuman, pengisian rencana kerja pagi, submit bukti laporan sore, hingga pemberian *feedback* dari pimpinan berfungsi 100% sempurna tanpa hambatan.

---

## 🎬 Skenario A: Pagi Hari - Direksi Memberi Informasi
**Aktor**: Khilal Hamdan (Direksi)

1. **Buka Aplikasi:** Buka `https://mahira-laporan-intergreted-with-tel.vercel.app` (atau `localhost:3000`).
2. **Login:** Masuk menggunakan email `khilal@gmail.com` dan password Anda.
3. **Cek Dashboard:** Pastikan *Overview* menampilkan statistik jumlah staff dengan benar.
4. **Buat Pengumuman:**
   - Navigasi ke menu **Pengumuman** di *sidebar* kiri.
   - Buat pengumuman baru. Contoh: 
     - **Judul:** `"Fokus IT Hari Ini"`
     - **Konten:** `"Mohon tim IT segera memastikan server lokal berjalan aman sebelum jam 12 siang."`
   - Simpan pengumuman.
5. **Logout:** Klik tombol Keluar / Logout di sudut kiri bawah layar untuk mengakhiri sesi.

---

## 🌅 Skenario B: Pagi Hari - Staff Membaca Info & Buat Rencana
**Aktor**: Khoirul Gunawan (Staff)

1. **Login:** Masuk menggunakan email `khoirulgunawan55@gmail.com`.
2. **Cek Beranda (Validasi Pengumuman):** 
   - Perhatikan bagian tengah/bawah halaman Beranda.
   - Pastikan pengumuman `"Fokus IT Hari Ini"` dari Direksi yang dibuat di Skenario A muncul dengan benar.
3. **Buat Rencana Kerja:**
   - Klik menu/kartu **📝 Laporan Harian**.
   - Karena masih pagi dan belum ada laporan, halaman akan menampilkan Form "1. Rencana Kerja Pagi".
   - Masukkan 2 tugas sebagai contoh:
     - *Tugas 1:* `"Pengecekan dan backup database server lokal"` -> **Prioritas Tinggi**.
     - *Tugas 2:* `"Merapikan kabel jaringan di ruang rapat"` -> **Prioritas Sedang**.
   - Klik tombol **Simpan Rencana Kerja**.
4. **Logout:** Klik Keluar / Logout.

*(Sampai di tahap ini, laporan Khoirul Gunawan berstatus **DRAFT**).*

---

## 🕵️‍♂️ Skenario C: Siang Hari - Direksi Memantau Kinerja
**Aktor**: Khilal Hamdan (Direksi)

1. **Login:** Masuk kembali dengan akun `khilal@gmail.com`.
2. **Pantau Kinerja Staff:**
   - Navigasi ke menu **Pantau Laporan**.
   - Pastikan di dalam daftar/tabel terdapat nama **Khoirul Gunawan**.
   - Cek kolom Status: Pastikan statusnya adalah **🔄 Draft (Belum Submit)** atau indikator kuning, yang menandakan staff sedang bekerja (sudah buat rencana tapi belum laporan akhir).
3. **Logout:** Keluar dari akun Direksi.

---

## 🌇 Skenario D: Sore Hari - Staff Melapor & Upload Bukti
**Aktor**: Khoirul Gunawan (Staff)

1. **Login:** Masuk dengan akun `khoirulgunawan55@gmail.com`.
2. **Buka Laporan Harian:**
   - Klik **📝 Laporan Harian**.
   - Halaman otomatis mendeteksi bahwa rencana sudah dibuat pagi harinya, dan sekarang menampilkan Form "2. Laporan Akhir Hari".
3. **Update Status Pekerjaan:**
   - *Tugas 1 (Backup database):* Ubah status menjadi **Selesai**. Tulis Catatan: `"Backup berhasil, ukuran 500MB, disimpan di cloud."`
   - *Tugas 2 (Kabel jaringan):* Ubah status menjadi **Dalam Proses**. Tulis Catatan: `"Kabel sudah dirapikan sebagian, sisa ruang rapat lantai 2 besok."`
4. **Upload Bukti Foto:**
   - Di bagian bawah form, cari kotak **Upload Bukti Foto Laporan**.
   - Klik kotak tersebut dan pilih 1 foto bebas (misalnya gambar pemandangan atau tangkapan layar apa saja berukuran di bawah 5MB).
5. **Submit Final:** Klik **Submit Laporan Final**. *Peringatan: setelah ini laporan tidak bisa diubah lagi.*
6. **Validasi Kunci Form:** Setelah sukses, form akan hilang dan digantikan oleh *Ringkasan Hari Ini* ber-icon ✅ hijau. Artinya laporan sudah permanen terkunci.
7. **Logout:** Keluar.

---

## 📋 Skenario E: Malam Hari - Direksi Review & Beri Catatan
**Aktor**: Khilal Hamdan (Direksi)

1. **Login:** Masuk dengan akun `khilal@gmail.com`.
2. **Buka Pantau Laporan:**
   - Masuk ke **Pantau Laporan**.
   - Perhatikan status Khoirul Gunawan. Seharusnya sekarang sudah berubah menjadi **✅ Sudah Submit** (warna hijau).
3. **Buka Detail Laporan & Foto:**
   - Klik baris/tombol aksi untuk melihat Detail Laporan Khoirul Gunawan.
   - Perhatikan ringkasan tugas: ada yang "Selesai" dan "Dalam Proses" beserta catatannya.
   - Di bagian bawah tugas, **pastikan Bukti Foto yang tadi di-upload Khoirul Gunawan muncul dengan jelas**.
4. **Beri Feedback Pimpinan:**
   - Di paling bawah, isi form *Komentar/Feedback Pimpinan*.
   - Ketik: `"Terima kasih updatenya Mas Khoirul. Tolong besok kabel lantai 2 langsung diselesaikan pertama kali."`
   - Klik tombol **Simpan Feedback**.
5. **Logout:** Keluar.

---

## ✨ Skenario F: Keeseokan Paginya - Staff Membaca Feedback
**Aktor**: Khoirul Gunawan (Staff)

1. **Login:** Masuk dengan `khoirulgunawan55@gmail.com`.
2. **Cek Laporan Kemarin:**
   - Masuk ke **Laporan Harian**. *(Catatan: Karena sistem membaca hari ini adalah hari yang sama saat Anda melakukan testing, halaman laporan masih akan menampilkan laporan "hari ini" yang sudah terkunci).*
   - Perhatikan *scroll* paling bawah.
   - **Pastikan terdapat sebuah box (biasanya beraksen hijau) berisi komentar / feedback dari Direksi: `"Terima kasih updatenya Mas Khoirul..."`**.

🎉 **TESTING SELESAI.**
Jika Skenario A hingga F berhasil dilalui tanpa *error*, itu membuktikan seluruh arsitektur database, form submission, RLS, Storage Image, dan logika aplikasi Anda sudah stabil 100%!

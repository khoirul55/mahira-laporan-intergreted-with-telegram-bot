# 🧠 Spesifikasi Logika: Sistem Laporan Harian Mahira Tour

Dokumen ini adalah panduan teknis (*business logic*) khusus untuk penanganan alur **Rencana Kerja (Pagi) ➔ Laporan (Sore)**, termasuk solusi untuk kasus-kasus khusus (*edge cases*). Dokumen ini harus dibaca oleh Developer/AI sebelum mengimplementasikan fitur CRUD Laporan Harian.

---

## 1. Alur Standar (The Happy Path)
1. **Pagi (07:00 - 09:00)**: Staff login, sistem mengecek apakah ada Rencana Kerja hari ini. Jika belum, tampilkan form "Buat Rencana Hari Ini". Staff menginput daftar tugas (Task 1, Task 2).
2. **Siang**: Staff bekerja (status laporan otomatis tersimpan sebagai `draft`).
3. **Sore (16:00 ke atas)**: Staff membuka aplikasi, mengubah status tugas (Selesai / Dalam Proses / Tidak Selesai), menambah catatan, dan menekan tombol **"Submit Laporan"**.
4. **Malam**: Laporan terkunci (*Read-Only*). Pimpinan bisa membaca laporan tersebut di Dashboard Direksi.

---

## 2. Penanganan Edge Cases (Kasus Khusus)

### A. Kasus "Lupa Submit Kemarin" (The Overdue Report)
- **Kondisi**: Staff membuat Rencana Kerja kemarin, tetapi lupa menekan tombol "Submit Laporan" di sore/malam hari (status masih `draft`).
- **Logika Sistem**:
  - Saat staff membuka halaman Laporan Harian hari ini, sistem **MEMBLOKIR** pembuatan Rencana Kerja hari ini.
  - Sistem memaksa menampilkan form "Laporan Kemarin yang Belum Selesai".
  - Staff harus men-submit laporan kemarin tersebut terlebih dahulu, barulah sistem membuka akses untuk membuat Rencana Kerja hari ini.

### B. Kasus "Lupa Buat Rencana Pagi" (The Late Planner)
- **Kondisi**: Staff lupa membuka aplikasi di pagi hari. Dia baru membuka aplikasi di jam 16:00 saat *reminder* masuk.
- **Logika Sistem**:
  - Sistem **TIDAK memblokir** staff.
  - Staff diizinkan membuat Rencana Kerja pada jam tersebut (meskipun sudah sore), lalu dia bisa langsung men-submit Laporan pada saat yang bersamaan atau beberapa menit setelahnya.
  - *Catatan untuk Pimpinan*: Waktu pembuatan rencana (`created_at`) akan tetap tercatat di database secara akurat.

### C. Kasus Bentrok dengan Izin / Ketidakhadiran (Conflict of State)
- **Kondisi**: Staff sudah mengajukan Izin hari ini melalui fitur "Pengajuan Izin".
- **Logika Sistem**:
  - Jika tipe izin = **Sakit** atau **Cuti**: Halaman form Laporan Harian dikunci sepenuhnya (ditampilkan pesan: *"Anda sedang dalam masa cuti/sakit hari ini. Selamat beristirahat."*).
  - Jika tipe izin = **Dinas Luar**: Halaman Laporan Harian **TETAP DIBUKA**, karena staff dinas luar tetap wajib melaporkan progres kerjanya di lapangan.

### D. Kasus Tugas Belum Selesai (Carry-Forward System)
- **Kondisi**: Di laporan kemarin, ada tugas dengan status "Tidak Selesai" atau "Dalam Proses".
- **Logika Sistem**:
  - Sistem **TIDAK otomatis** memindahkan tugas tersebut ke rencana hari ini secara sepihak.
  - Saat staff membuat Rencana Kerja di pagi hari, sistem akan menampilkan pop-up/rekomendasi: *"Ada X tugas kemarin yang belum selesai. Centang tugas yang ingin Anda lanjutkan hari ini:"*.
  - Staff memiliki kendali penuh untuk memilih tugas mana yang relevan untuk dikerjakan hari ini. (Tugas yang dipilih akan disimpan dengan relasi `source_task_id` ke tugas hari sebelumnya).

### E. Kasus Edit Setelah Submit (The Lock Mechanism)
- **Kondisi**: Staff menyadari ada kesalahan ketik atau lupa memasukkan tugas setelah dia menekan tombol "Submit Laporan".
- **Logika Sistem**:
  - Status `submitted` berarti **TERKUNCI** untuk modifikasi (*Read-Only*).
  - Staff tidak dapat mengedit (*unsubmit*) laporan di sisi UI (versi MVP). Jika ada revisi penting, staff harus menuliskannya di laporan keesokan harinya, atau Pimpinan yang dapat mengeditnya/mengembalikannya ke status `draft` melalui Admin Dashboard (jika fitur ini diaktifkan nantinya).

---

> **Developer Note:**
> File ini harus dijadikan landasan logika sebelum membuat fungsi-fungsi *Server Actions* untuk Laporan di file `src/actions/report.ts` dan sebelum mendesain komponen UI di `src/app/(staff)/beranda/laporan/page.tsx`.

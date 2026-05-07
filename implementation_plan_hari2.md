# 🚀 Implementation Plan — Hari 2: CRUD User, Divisi, & Sistem Izin

> **Fokus Utama**: Memastikan logika dasar, integrasi database, dan *flow* sistem berjalan lancar tanpa bug.  
> **UI/UX**: Menggunakan komponen *shadcn/ui* sederhana terlebih dahulu. *Polish* visual (animasi, tata letak kompleks) akan dilakukan di tahap akhir (Hari 3/4).

---

## Step 1: CRUD Divisi (Dashboard Pimpinan)

**Lokasi**: `src/app/(direksi)/dashboard/divisions/page.tsx`

**Logika & Fungsi**:
1. **Read**: Menampilkan semua daftar divisi dari tabel `divisions`.
2. **Create**: Form sederhana untuk menambah divisi baru (nama & deskripsi).
3. **Update**: Form untuk mengubah nama atau deskripsi divisi.
4. **Delete**: Menghapus divisi. 
   *⚠️ Logika Penting: Kita harus mengecek apakah divisi ini masih memiliki anggota (user). Jika iya, sistem harus menolak penghapusan agar tidak terjadi error relasi database.*

**Komponen UI**: Table, Button, Dialog (Modal Form).

---

## Step 2: Kelola Akun Staff / CRUD User (Dashboard Pimpinan)

**Lokasi**: `src/app/(direksi)/dashboard/users/page.tsx`

**Logika & Fungsi**:
1. **Read**: Menampilkan semua daftar staff dari tabel `users` beserta nama divisinya (menggunakan relasi `.select('..., divisions(name)')`).
2. **Create (Admin Creation)**: 
   - Pimpinan mengisi Form: Nama, Email, Password, Role, dan Divisi.
   - *⚠️ Logika Penting*: Menggunakan fungsi khusus `SUPABASE_SERVICE_ROLE_KEY` di backend (Server Action) untuk mendaftarkan user melewati *Supabase Auth API*. Setelah terdaftar di `auth.users`, trigger database yang kita buat di Hari 1 akan otomatis memasukkannya ke tabel `public.users`.
3. **Update**: Mengubah divisi, nama, atau menonaktifkan (`is_active` = false) akun staff.
4. **Delete**: Menghapus permanen user dari database.

**Komponen UI**: Table, Button, Dialog, Select (Dropdown Divisi).

---

## Step 3: Pengajuan Izin / Absen (Beranda Staff)

**Lokasi**: `src/app/(staff)/beranda/izin/page.tsx`

**Logika & Fungsi**:
1. **Read (Riwayat)**: Staff bisa melihat daftar izin yang pernah diajukan sebelumnya.
2. **Create (Pengajuan)**: 
   - Form input: Tanggal, Tipe Izin (Sakit / Cuti / Dinas Luar / Lainnya), dan Alasan.
   - *⚠️ Logika Penting*: Mencegah duplikasi data. Database sudah dilindungi oleh aturan `UNIQUE(user_id, absence_date)`, tapi UI harus bisa menangkap error ini dan memberi tahu user "Anda sudah mengajukan izin di tanggal ini".

**Komponen UI**: Form standar, Input Date, Select, Card Riwayat.

---

## Step 4: Rekap Izin Keseluruhan (Dashboard Pimpinan)

**Lokasi**: `src/app/(direksi)/dashboard/absences/page.tsx`

**Logika & Fungsi**:
1. **Read (Monitor)**: Pimpinan bisa melihat riwayat izin dari **semua staff**. Data akan di-join dengan tabel `users` untuk menampilkan nama staff.
2. **Filter (Optional Sederhana)**: Filter sederhana berdasarkan bulan atau tipe izin agar tidak terlalu menumpuk.

**Komponen UI**: Data Table.

---

## Urutan Eksekusi Pengerjaan (Hari Ini):

1. Membuat UI layout sederhana untuk sidebar/navigasi Dashboard Direksi (agar mudah pindah-pindah halaman).
2. Mengeksekusi **Step 1 (Divisi)** (Paling mudah, untuk pemanasan).
3. Mengeksekusi **Step 2 (User)** (Paling menantang secara logika karena terkait Auth).
4. Mengeksekusi **Step 3 & 4 (Izin)**.
5. Uji Coba (Testing) alur dari ujung ke ujung.

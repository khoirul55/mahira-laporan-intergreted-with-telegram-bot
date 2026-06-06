-- ============================================
-- MIGRATION: Fix Foreign Keys untuk Delete User
-- Tanggal: 06 Juni 2026
-- Masalah: Tidak bisa hapus user karena FK tanpa ON DELETE CASCADE
-- Solusi: Ubah semua FK referensi ke users(id) jadi ON DELETE CASCADE
-- ============================================

-- 1. announcements.created_by → CASCADE
ALTER TABLE announcements
  DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE announcements
  ADD CONSTRAINT announcements_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- 2. report_notes.noted_by → CASCADE
ALTER TABLE report_notes
  DROP CONSTRAINT IF EXISTS report_notes_noted_by_fkey;
ALTER TABLE report_notes
  ADD CONSTRAINT report_notes_noted_by_fkey
  FOREIGN KEY (noted_by) REFERENCES users(id) ON DELETE CASCADE;

-- 3. division_documents.uploaded_by → CASCADE
ALTER TABLE division_documents
  DROP CONSTRAINT IF EXISTS division_documents_uploaded_by_fkey;
ALTER TABLE division_documents
  ADD CONSTRAINT division_documents_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE;

-- 4. daily_reports.acknowledged_by → CASCADE (nullable)
ALTER TABLE daily_reports
  DROP CONSTRAINT IF EXISTS daily_reports_acknowledged_by_fkey;
ALTER TABLE daily_reports
  ADD CONSTRAINT daily_reports_acknowledged_by_fkey
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- CATATAN:
-- - acknowledged_by pakai SET NULL (bukan CASCADE) karena
--   jika direksi yang acknowledge dihapus, laporan staff
--   tidak boleh ikut hilang. Cukup null-kan siapa yg acknowledge.
-- - Setelah jalankan ini, hapus user akan berhasil.
-- ============================================

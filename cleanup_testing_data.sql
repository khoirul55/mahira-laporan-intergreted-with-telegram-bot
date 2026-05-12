-- ============================================================
-- CLEANUP: Hapus Semua Data Testing - Mahira Tour
-- Tanggal: 12 Mei 2026
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ⚠️  HATI-HATI: Script ini menghapus SEMUA data transaksi!
--     Data master (divisions, users) TIDAK akan dihapus.
-- ============================================================

-- Urutan delete mengikuti relasi foreign key (child → parent)

-- 1. Hapus feedback/catatan direksi
DELETE FROM report_notes;

-- 2. Hapus attachment/foto bukti
DELETE FROM report_attachments;

-- 3. Hapus update status tugas
DELETE FROM task_updates;

-- 4. Hapus laporan harian
DELETE FROM daily_reports;

-- 5. Hapus tugas-tugas dalam rencana
DELETE FROM plan_tasks;

-- 6. Hapus rencana kerja harian
DELETE FROM daily_work_plans;

-- 7. Hapus data baca pengumuman
DELETE FROM announcement_reads;

-- 8. Hapus pengumuman
DELETE FROM announcements;

-- 9. Hapus data izin/absensi
DELETE FROM absences;

-- 10. Hapus arsip dokumen divisi
DELETE FROM division_documents;

-- 11. Hapus laporan bulanan
DELETE FROM monthly_reports;

-- ✅ Selesai! Semua data transaksi sudah dihapus.
-- Data master (divisions & users) tetap ada.

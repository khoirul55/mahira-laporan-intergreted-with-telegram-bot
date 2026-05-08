-- ============================================
-- MAHIRA TOUR — Schema Arsip Dokumen Divisi
-- Hari 4 - Phase 1: Arsip Dokumen
-- Tanggal: 8 Mei 2026
-- ============================================

-- =====================
-- 1. TABEL DIVISION_FILES
-- =====================
CREATE TABLE IF NOT EXISTS division_files (
  id SERIAL PRIMARY KEY,
  division_id INT REFERENCES divisions(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 2. ENABLE RLS
-- =====================
ALTER TABLE division_files ENABLE ROW LEVEL SECURITY;

-- =====================
-- 3. RLS POLICIES
-- =====================

-- Staff bisa melihat file divisi sendiri
CREATE POLICY "Staff can read own division files" ON division_files
  FOR SELECT USING (
    division_id = get_user_division() OR get_user_role() = 'direksi'
  );

-- Staff bisa upload ke divisi sendiri
CREATE POLICY "Staff can upload to own division" ON division_files
  FOR INSERT WITH CHECK (
    division_id = get_user_division() OR get_user_role() = 'direksi'
  );

-- Staff bisa update file divisi sendiri (description)
CREATE POLICY "Staff can update own division files" ON division_files
  FOR UPDATE USING (
    division_id = get_user_division() OR get_user_role() = 'direksi'
  );

-- Staff bisa hapus file divisi sendiri
CREATE POLICY "Staff can delete own division files" ON division_files
  FOR DELETE USING (
    division_id = get_user_division() OR get_user_role() = 'direksi'
  );

-- =====================
-- 4. INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_division_files_division ON division_files(division_id);
CREATE INDEX idx_division_files_uploaded_by ON division_files(uploaded_by);
CREATE INDEX idx_division_files_created_at ON division_files(created_at DESC);

-- =====================
-- 5. STORAGE BUCKET SETUP
-- =====================
-- Note: Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- Bucket akan dibuat otomatis jika belum ada

-- Buat bucket untuk arsip dokumen (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'division-archives',
  'division-archives', 
  false,
  10485760, -- 10MB max file size
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- =====================
-- 6. STORAGE RLS POLICIES
-- =====================

-- Staff bisa upload ke folder divisi sendiri
CREATE POLICY "Staff can upload to own division folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'division-archives' AND 
    (auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        CASE 
          WHEN split_part(name, '/', 1) ~ '^[0-9]+$' 
          THEN split_part(name, '/', 1)::int 
          ELSE NULL 
        END
      )
    ) OR get_user_role() = 'direksi')
  );

-- Staff bisa melihat file divisi sendiri
CREATE POLICY "Staff can read own division files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'division-archives' AND 
    (auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        CASE 
          WHEN split_part(name, '/', 1) ~ '^[0-9]+$' 
          THEN split_part(name, '/', 1)::int 
          ELSE NULL 
        END
      )
    ) OR get_user_role() = 'direksi')
  );

-- Staff bisa update file divisi sendiri
CREATE POLICY "Staff can update own division files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'division-archives' AND 
    (auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        CASE 
          WHEN split_part(name, '/', 1) ~ '^[0-9]+$' 
          THEN split_part(name, '/', 1)::int 
          ELSE NULL 
        END
      )
    ) OR get_user_role() = 'direksi')
  );

-- Staff bisa hapus file divisi sendiri
CREATE POLICY "Staff can delete own division files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'division-archives' AND 
    (auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        CASE 
          WHEN split_part(name, '/', 1) ~ '^[0-9]+$' 
          THEN split_part(name, '/', 1)::int 
          ELSE NULL 
        END
      )
    ) OR get_user_role() = 'direksi')
  );

-- =====================
-- 7. HELPER FUNCTIONS
-- =====================

-- Function untuk generate file path
CREATE OR REPLACE FUNCTION generate_archive_file_path(
  p_division_id INT,
  p_user_id UUID,
  p_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_division_name TEXT;
  v_timestamp TEXT;
BEGIN
  -- Get division name
  SELECT name INTO v_division_name 
  FROM divisions 
  WHERE id = p_division_id;
  
  -- Generate timestamp
  v_timestamp := to_char(now(), 'YYYY-MM-DD_HH24-MI-SS');
  
  -- Return path: {division_id}/{user_id}_{timestamp}_{filename}
  RETURN FORMAT('%s/%s_%s_%s', p_division_id, p_user_id, v_timestamp, p_filename);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

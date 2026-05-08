-- ============================================
-- MAHIRA TOUR — Search Performance Indexes (FIXED)
-- Hari 4 - Phase 2: Pencarian & Filter
-- Tanggal: 8 Mei 2026
-- ============================================

-- =====================
-- 1. EXTENSIONS (jika belum ada)
-- =====================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- 2. BASIC INDEXES (aman untuk semua tabel)
-- =====================

-- Index untuk users (search by name)
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm 
ON users 
USING gin(full_name gin_trgm_ops);

-- Index untuk divisions (search by name)
CREATE INDEX IF NOT EXISTS idx_divisions_name_trgm 
ON divisions 
USING gin(name gin_trgm_ops);

-- Index untuk division_files (performance)
CREATE INDEX IF NOT EXISTS idx_division_files_division_created 
ON division_files(division_id, created_at DESC);

-- Index untuk absences (performance)
CREATE INDEX IF NOT EXISTS idx_absences_date_user 
ON absences(absence_date DESC, user_id);

-- =====================
-- 3. DAILY_REPORTS INDEXES (hanya jika tabel ada)
-- =====================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reports' AND table_schema = 'public') THEN
        
        -- Index untuk filter by date dan status
        CREATE INDEX IF NOT EXISTS idx_daily_reports_date_status 
        ON daily_reports(report_date DESC, status);
        
        -- Index untuk join dengan users
        CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date 
        ON daily_reports(user_id, report_date DESC);
        
        -- Cek kolom yang ada sebelum buat search index
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'daily_reports' 
            AND column_name IN ('plan_notes', 'notes', 'direksi_notes')
        ) THEN
            -- Full-text search index
            CREATE INDEX IF NOT EXISTS idx_daily_reports_search 
            ON daily_reports 
            USING gin(to_tsvector('indonesian', 
                COALESCE(plan_notes, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(direksi_notes, '')
            ));
        END IF;
        
    END IF;
END $$;

-- =====================
-- 4. ANNOUNCEMENTS INDEXES (jika tabel ada)
-- =====================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_announcements_created_target 
        ON announcements(created_at DESC, target_division_id);
    END IF;
END $$;

-- =====================
-- 5. PERFORMANCE INDEXES
-- =====================

-- Index untuk users dengan division dan active status
CREATE INDEX IF NOT EXISTS idx_users_division_active 
ON users(division_id, is_active) 
WHERE role = 'staff';

-- Partial index untuk submitted reports (optimasi dashboard)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reports' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted 
        ON daily_reports(report_date DESC, user_id) 
        WHERE status = 'submitted';
    END IF;
END $$;

-- =====================
-- 6. UPDATE STATISTICS
-- =====================

ANALYZE users;
ANALYZE divisions;
ANALYZE division_files;
ANALYZE absences;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reports' AND table_schema = 'public') THEN
        ANALYZE daily_reports;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements' AND table_schema = 'public') THEN
        ANALYZE announcements;
    END IF;
END $$;

-- =====================
-- 7. COMMENTS (dokumentasi)
-- =====================

COMMENT ON INDEX idx_users_full_name_trgm IS 'Trigram index untuk user name search';
COMMENT ON INDEX idx_divisions_name_trgm IS 'Trigram index untuk division name search';
COMMENT ON INDEX idx_division_files_division_created IS 'Performance index untuk division_files queries';

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reports' AND table_schema = 'public') THEN
        COMMENT ON INDEX idx_daily_reports_date_status IS 'Performance index untuk date dan status filter';
        COMMENT ON INDEX idx_daily_reports_user_date IS 'Performance index untuk user-date join';
        
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'daily_reports' 
            AND column_name IN ('plan_notes', 'notes', 'direksi_notes')
        ) THEN
            COMMENT ON INDEX idx_daily_reports_search IS 'Full-text search index untuk daily_reports content';
        END IF;
    END IF;
END $$;

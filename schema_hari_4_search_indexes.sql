-- ============================================
-- MAHIRA TOUR — Search Performance Indexes
-- Hari 4 - Phase 2: Pencarian & Filter
-- Tanggal: 8 Mei 2026
-- ============================================

-- =====================
-- 1. FULL-TEXT SEARCH INDEXES
-- =====================

-- Index untuk pencarian di daily_reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_search 
ON daily_reports 
USING gin(to_tsvector('indonesian', 
  COALESCE(plan_notes, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(direksi_notes, '')
));

-- Index untuk pencarian di users (untuk search by name)
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm 
ON users 
USING gin(full_name gin_trgm_ops);

-- Index untuk pencarian di divisions
CREATE INDEX IF NOT EXISTS idx_divisions_name_trgm 
ON divisions 
USING gin(name gin_trgm_ops);

-- =====================
-- 2. PERFORMANCE INDEXES
-- =====================

-- Index untuk filter by date di daily_reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_date_status 
ON daily_reports(report_date DESC, status);

-- Index untuk join dengan users dan divisions
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_division 
ON daily_reports(user_id, report_date DESC);

-- Index untuk filter by division (via users)
CREATE INDEX IF NOT EXISTS idx_users_division_active 
ON users(division_id, is_active) WHERE role = 'staff';

-- Index untuk division_files performance
CREATE INDEX IF NOT EXISTS idx_division_files_division_created 
ON division_files(division_id, created_at DESC);

-- Index untuk absences performance
CREATE INDEX IF NOT EXISTS idx_absences_date_user 
ON absences(absence_date DESC, user_id);

-- =====================
-- 3. COMPOSITE INDEXES
-- =====================

-- Index untuk search + filter combination
CREATE INDEX IF NOT EXISTS idx_daily_reports_search_filter 
ON daily_reports(report_date DESC, status, user_id) 
INCLUDE (plan_notes, notes, direksi_notes);

-- Index untuk announcements performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_target 
ON announcements(created_at DESC, target_division_id);

-- =====================
-- 4. PARTIAL INDEXES (OPTIMIZATION)
-- =====================

-- Index hanya untuk reports yang submitted (untuk dashboard)
CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted 
ON daily_reports(report_date DESC, user_id) 
WHERE status = 'submitted';

-- Index hanya untuk reports yang masih draft (untuk reminder)
CREATE INDEX IF NOT EXISTS idx_daily_reports_draft 
ON daily_reports(report_date DESC, user_id) 
WHERE status IN ('draft', 'plan_only');

-- =====================
-- 5. STATISTICS UPDATE
-- =====================

-- Update table statistics untuk query planner
ANALYZE daily_reports;
ANALYZE users;
ANALYZE divisions;
ANALYZE division_files;
ANALYZE absences;
ANALYZE announcements;

-- =====================
-- 6. SEARCH HELPER FUNCTIONS
-- =====================

-- Function untuk advanced search dengan ranking
CREATE OR REPLACE FUNCTION search_reports(
  search_query TEXT,
  filter_division_id INT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  filter_date_from DATE DEFAULT NULL,
  filter_date_to DATE DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id INT,
  user_id UUID,
  report_date DATE,
  status TEXT,
  plan_notes TEXT,
  notes TEXT,
  direksi_notes TEXT,
  created_at TIMESTAMPTZ,
  full_name TEXT,
  division_name TEXT,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id,
    dr.user_id,
    dr.report_date,
    dr.status,
    dr.plan_notes,
    dr.notes,
    dr.direksi_notes,
    dr.created_at,
    u.full_name,
    d.name as division_name,
    ts_rank(
      to_tsvector('indonesian', 
        COALESCE(dr.plan_notes, '') || ' ' || COALESCE(dr.notes, '') || ' ' || COALESCE(dr.direksi_notes, '')
      ),
      plainto_tsquery('indonesian', search_query)
    ) as search_rank
  FROM daily_reports dr
  JOIN users u ON dr.user_id = u.id
  LEFT JOIN divisions d ON u.division_id = d.id
  WHERE 
    -- Search filter
    (search_query IS NULL OR 
     to_tsvector('indonesian', 
       COALESCE(dr.plan_notes, '') || ' ' || COALESCE(dr.notes, '') || ' ' || COALESCE(dr.direksi_notes, '')
     ) @@ plainto_tsquery('indonesian', search_query))
    
    -- Division filter
    AND (filter_division_id IS NULL OR u.division_id = filter_division_id)
    
    -- Status filter
    AND (filter_status IS NULL OR filter_status = 'all' OR dr.status = filter_status)
    
    -- Date range filter
    AND (filter_date_from IS NULL OR dr.report_date >= filter_date_from)
    AND (filter_date_to IS NULL OR dr.report_date <= filter_date_to)
  
  ORDER BY search_rank DESC, dr.report_date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_reports TO authenticated;

-- =====================
-- 7. PERFORMANCE MONITORING
-- =====================

-- View untuk monitoring query performance
CREATE OR REPLACE VIEW search_performance_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('daily_reports', 'users', 'divisions', 'division_files')
ORDER BY idx_scan DESC;

-- Comment untuk dokumentasi
COMMENT ON INDEX idx_daily_reports_search IS 'Full-text search index for daily_reports content';
COMMENT ON INDEX idx_users_full_name_trgm IS 'Trigram index for user name search';
COMMENT ON INDEX idx_divisions_name_trgm IS 'Trigram index for division name search';
COMMENT ON FUNCTION search_reports IS 'Advanced search function with ranking and filters';

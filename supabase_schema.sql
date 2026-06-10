-- ============================================
-- MAHIRA TOUR — Sistem Laporan Terintegrasi
-- Full Database Schema
-- Tanggal: 06 Mei 2026
-- ============================================

-- =====================
-- 1. EXTENSIONS
-- =====================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- 2. TABEL DIVISIONS
-- =====================
CREATE TABLE divisions (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. TABEL USERS
-- =====================
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'direksi')),
  division_id   INT REFERENCES divisions(id),
  telegram_id   TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create user row saat register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- 4. TABEL ABSENCES
-- =====================
CREATE TABLE absences (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  absence_date  DATE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('sakit', 'cuti', 'dinas_luar', 'lainnya')),
  reason        TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, absence_date)
);

-- =====================
-- 5. TABEL ANNOUNCEMENTS
-- =====================
CREATE TABLE announcements (
  id                  SERIAL PRIMARY KEY,
  created_by          UUID NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  target_division_id  INT REFERENCES divisions(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE announcement_reads (
  id              SERIAL PRIMARY KEY,
  announcement_id INT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- =====================
-- 6. TABEL DAILY WORK PLANS
-- =====================
CREATE TABLE daily_work_plans (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  division_id INT NOT NULL REFERENCES divisions(id),
  plan_date   DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

-- =====================
-- 7. TABEL PLAN TASKS
-- =====================
CREATE TABLE plan_tasks (
  id             SERIAL PRIMARY KEY,
  plan_id        INT NOT NULL REFERENCES daily_work_plans(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  priority       TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('tinggi', 'sedang', 'rendah')),
  is_adhoc       BOOLEAN DEFAULT false,
  source_task_id INT REFERENCES plan_tasks(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 8. TABEL DAILY REPORTS
-- =====================
CREATE TABLE daily_reports (
  id              SERIAL PRIMARY KEY,
  plan_id         INT NOT NULL REFERENCES daily_work_plans(id) UNIQUE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  division_id     INT NOT NULL REFERENCES divisions(id),
  report_date     DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at    TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  UNIQUE(user_id, report_date)
);

-- =====================
-- 9. TABEL TASK UPDATES
-- =====================
CREATE TABLE task_updates (
  id                SERIAL PRIMARY KEY,
  report_id         INT NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  plan_task_id      INT NOT NULL REFERENCES plan_tasks(id) ON DELETE CASCADE,
  completion_status TEXT NOT NULL CHECK (completion_status IN ('selesai', 'dalam_proses', 'tidak_selesai', 'dibatalkan')),
  notes             TEXT
);

-- =====================
-- 10. TABEL REPORT ATTACHMENTS
-- =====================
CREATE TABLE report_attachments (
  id          SERIAL PRIMARY KEY,
  report_id   INT NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  file_size   INT,
  file_type   TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 11. TABEL REPORT NOTES
-- =====================
CREATE TABLE report_notes (
  id         SERIAL PRIMARY KEY,
  report_id  INT NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  noted_by   UUID NOT NULL REFERENCES users(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 12. TABEL DIVISION DOCUMENTS
-- =====================
CREATE TABLE division_documents (
  id          SERIAL PRIMARY KEY,
  division_id INT NOT NULL REFERENCES divisions(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'lainnya' CHECK (category IN ('sop', 'kontrak', 'laporan', 'template', 'lainnya')),
  file_path   TEXT NOT NULL,
  file_size   INT,
  file_type   TEXT,
  description TEXT,
  is_pinned   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 13. TABEL MONTHLY REPORTS
-- =====================
CREATE TABLE monthly_reports (
  id                  SERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  division_id         INT NOT NULL REFERENCES divisions(id),
  month               INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year                INT NOT NULL,
  auto_generated_data JSONB,
  achievements        TEXT,
  challenges          TEXT,
  next_month_plan     TEXT,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS pada semua tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- =====================
-- HELPER FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_division()
RETURNS INT AS $$
  SELECT division_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================
-- POLICIES: users
-- =====================
CREATE POLICY "Users readable by authenticated"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users self update"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Direksi manage users"
  ON users FOR ALL
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: divisions
-- =====================
CREATE POLICY "Divisions readable"
  ON divisions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Direksi manage divisions"
  ON divisions FOR ALL
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: absences
-- =====================
CREATE POLICY "Staff manage own absences"
  ON absences FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Direksi view all absences"
  ON absences FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: announcements
-- =====================
CREATE POLICY "Read announcements"
  ON announcements FOR SELECT
  USING (
    target_division_id IS NULL
    OR target_division_id = get_user_division()
    OR get_user_role() = 'direksi'
  );

CREATE POLICY "Direksi manage announcements"
  ON announcements FOR ALL
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: announcement_reads
-- =====================
CREATE POLICY "Users manage own reads"
  ON announcement_reads FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Direksi view all reads"
  ON announcement_reads FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: daily_work_plans
-- =====================
CREATE POLICY "Staff manage own plans"
  ON daily_work_plans FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Direksi view all plans"
  ON daily_work_plans FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: plan_tasks
-- =====================
CREATE POLICY "Staff manage own tasks"
  ON plan_tasks FOR ALL
  USING (
    plan_id IN (SELECT id FROM daily_work_plans WHERE user_id = auth.uid())
  );

CREATE POLICY "Direksi view all tasks"
  ON plan_tasks FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: daily_reports
-- =====================
CREATE POLICY "Staff manage own reports"
  ON daily_reports FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Direksi view all reports"
  ON daily_reports FOR SELECT
  USING (get_user_role() = 'direksi');

CREATE POLICY "Direksi acknowledge reports"
  ON daily_reports FOR UPDATE
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: task_updates
-- =====================
CREATE POLICY "Staff manage own updates"
  ON task_updates FOR ALL
  USING (
    report_id IN (SELECT id FROM daily_reports WHERE user_id = auth.uid())
  );

CREATE POLICY "Direksi view all updates"
  ON task_updates FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: report_attachments
-- =====================
CREATE POLICY "Staff manage own attachments"
  ON report_attachments FOR ALL
  USING (
    report_id IN (SELECT id FROM daily_reports WHERE user_id = auth.uid())
  );

CREATE POLICY "Direksi view all attachments"
  ON report_attachments FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: report_notes
-- =====================
CREATE POLICY "Read own report notes"
  ON report_notes FOR SELECT
  USING (
    report_id IN (SELECT id FROM daily_reports WHERE user_id = auth.uid())
    OR get_user_role() = 'direksi'
  );

CREATE POLICY "Direksi create notes"
  ON report_notes FOR INSERT
  WITH CHECK (get_user_role() = 'direksi');

-- =====================
-- POLICIES: division_documents
-- =====================
CREATE POLICY "Staff manage own division docs"
  ON division_documents FOR ALL
  USING (division_id = get_user_division());

CREATE POLICY "Direksi view all docs"
  ON division_documents FOR SELECT
  USING (get_user_role() = 'direksi');

-- =====================
-- POLICIES: monthly_reports
-- =====================
CREATE POLICY "Staff manage own monthly"
  ON monthly_reports FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Direksi view all monthly"
  ON monthly_reports FOR SELECT
  USING (get_user_role() = 'direksi');

-- =============================================
-- INDEXES (Performance)
-- =============================================
CREATE INDEX idx_users_division ON users(division_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_absences_date ON absences(user_id, absence_date);
CREATE INDEX idx_plans_date ON daily_work_plans(user_id, plan_date);
CREATE INDEX idx_plans_division ON daily_work_plans(division_id, plan_date);
CREATE INDEX idx_reports_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_reports_division ON daily_reports(division_id, report_date);
CREATE INDEX idx_reports_status ON daily_reports(status);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX idx_documents_division ON division_documents(division_id);
CREATE INDEX idx_monthly_period ON monthly_reports(user_id, year, month);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO divisions (name, description) VALUES
  ('Operasional', 'Divisi operasional & handling jamaah'),
  ('Marketing', 'Divisi pemasaran & penjualan'),
  ('Keuangan', 'Divisi keuangan & administrasi');

-- =============================================
-- DONE! ✅
-- Next: Buat user pertama di Authentication → Users
-- =============================================

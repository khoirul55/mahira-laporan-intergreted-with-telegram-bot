-- Update table daily_reports untuk menambahkan kolom feedback dari pimpinan dan bukti
ALTER TABLE public.daily_reports
ADD COLUMN IF NOT EXISTS direksi_notes TEXT,
ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- Buat table announcements untuk Papan Pengumuman
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Semua orang bisa membaca pengumuman
CREATE POLICY "Semua orang bisa melihat pengumuman"
ON public.announcements FOR SELECT
USING (true);

-- Hanya direksi yang bisa membuat/mengubah/menghapus pengumuman
CREATE POLICY "Hanya direksi yang bisa kelola pengumuman"
ON public.announcements FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'direksi'
    )
);

-- Note: Untuk storage (Fase 3: Upload Foto), Anda dapat membuatnya langsung via Dashboard Supabase di menu "Storage".
-- Buat bucket dengan nama "report_evidences" dan setel ke "Public".

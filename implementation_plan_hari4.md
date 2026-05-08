# 🚀 Implementation Plan — Hari 4: Finalisasi Sistem Terintegrasi

> **Tanggal**: 8 Mei 2026  
> **Target**: Melengkapi fitur-fitur pending dan mempersiapkan sistem untuk production  
> **Estimasi**: 4-5 jam kerja  
> **Status**: 75% Complete - Final Features & Polish

---

## 📊 **Status Sistem Saat Ini (Hari 1-3 Selesai)**

### ✅ **Core Features (100% Working)**
- ✅ Otentikasi & Role-based Access (Staff/Direksi)
- ✅ CRUD User & Divisi Management
- ✅ Sistem Izin/Absensi (Pengajuan & Monitoring)
- ✅ **LAPORAN HARIAN** (Core Feature):
  - ✅ Rencana kerja pagi hari
  - ✅ Update status sore hari  
  - ✅ Upload bukti foto
  - ✅ Detail laporan & feedback pimpinan
- ✅ Papan Pengumuman (Broadcast Direksi → Staff)
- ✅ Dashboard monitoring real-time

### 🎯 **Remaining Features (Target Hari 4)**
1. **Arsip Dokumen Divisi** - Storage internal file sharing
2. **Pencarian & Filter** - Search functionality across reports
3. **Integrasi Telegram Bot** - Automated reminders

---

## 🗂️ **Phase 1: Arsip Dokumen Divisi (Estimasi: 90 Menit)**

### 1.1 Setup Supabase Storage (20 menit)
```sql
-- Buat bucket untuk arsip dokumen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('division-archives', 'division-archives', false);

-- RLS Policies
CREATE POLICY "Staff can upload to own division" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'division-archives' AND 
    auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        SELECT split_part(name, '_', 1)::int FROM divisions 
        WHERE name = split_part(storage.foldername(name), '/', 1)
      )
    )
  );

CREATE POLICY "Staff can read own division files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'division-archives' AND 
    auth.uid() IN (
      SELECT id FROM users WHERE division_id = (
        SELECT split_part(name, '_', 1)::int FROM divisions 
        WHERE name = split_part(storage.foldername(name), '/', 1)
      )
    ) OR get_user_role() = 'direksi'
  );
```

### 1.2 Database Schema (15 menit)
```sql
CREATE TABLE division_files (
  id SERIAL PRIMARY KEY,
  division_id INT REFERENCES divisions(id),
  uploaded_by UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE division_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage own division files" ON division_files
  FOR ALL USING (division_id = get_user_division() OR get_user_role() = 'direksi');
```

### 1.3 UI Components (45 menit)
**Location**: `src/app/(staff)/beranda/arsip/page.tsx`
- File upload component (drag & drop)
- File list dengan preview
- Download functionality
- Delete dengan konfirmasi

**Location**: `src/app/(direksi)/dashboard/arsip/page.tsx`
- View all divisions files
- Filter by division
- Download semua file

### 1.4 Server Actions (10 menit)
**Location**: `src/actions/archive.ts`
- `uploadFile(divisionId, file, description)`
- `deleteFile(fileId)`
- `getDivisionFiles(divisionId)`
- `getAllFiles()` // for direksi

---

## 🔍 **Phase 2: Pencarian & Filter (Estimasi: 75 Menit)**

### 2.1 Search Component (30 menit)
**Location**: `src/components/search-bar.tsx`
```typescript
interface SearchProps {
  placeholder: string
  onSearch: (query: string) => void
  filters?: {
    dateRange?: boolean
    division?: boolean
    status?: boolean
  }
}
```

### 2.2 Implementasi di Halaman Laporan (25 menit)
**Staff**: `src/app/(staff)/beranda/riwayat/page.tsx`
- Cari riwayat laporan sendiri
- Filter by tanggal & status

**Direksi**: `src/app/(direksi)/dashboard/laporan/page.tsx`
- Cari laporan semua staff
- Filter by nama, divisi, tanggal, status
- Export to CSV functionality

### 2.3 Database Optimization (20 menit)
```sql
-- Add search index
CREATE INDEX idx_reports_search ON daily_reports 
USING gin(to_tsvector('indonesian', 
  COALESCE(plan_notes, '') || ' ' || COALESCE(notes, '')
));

CREATE INDEX idx_reports_user_date ON daily_reports(user_id, report_date);
```

---

## 🤖 **Phase 3: Integrasi Telegram Bot (Estimasi: 90 Menit)**

### 3.1 Setup Telegram Bot (25 menit)
1. **Buat Bot**:
   - Chat dengan @BotFather di Telegram
   - `/newbot` → nama: "Mahira Tour Reporter"
   - Dapatkan **BOT TOKEN**

2. **Setup Webhook**:
```typescript
// Location: src/app/api/telegram/webhook/route.ts
export async function POST(request: Request) {
  const update = await request.json()
  
  if (update.message) {
    // Handle commands
    await handleCommands(update.message)
  }
  
  return Response.json({ ok: true })
}
```

### 3.2 Reminder System (35 menit)
**Location**: `src/actions/telegram.ts`
```typescript
// Fungsi kirim reminder jam 16:00
export async function sendDailyReminder() {
  const today = new Date().toISOString().split('T')[0]
  
  // Cari staff yang belum submit laporan
  const { data: pendingStaff } = await supabase
    .from('daily_reports')
    .select('users(*)')
    .eq('report_date', today)
    .in('status', ['draft', 'plan_only'])
    .not('users.telegram_id', 'is', null)
  
  // Kirim reminder ke masing-masing
  for (const staff of pendingStaff) {
    await sendTelegramMessage(
      staff.users.telegram_id,
      `🔔 *Reminder Laporan Harian*\n\nHalo ${staff.users.full_name},\nLaporan harian Anda belum disubmit. Segera lengkapi di: https://laporan.mahiratour.id/beranda/laporan`
    )
  }
}
```

### 3.3 Weekly Digest (20 menit)
```typescript
// Setiap Senin pagi kirim summary minggu lalu
export async function sendWeeklyDigest() {
  const lastWeek = getLastWeekRange()
  
  const { data: summary } = await supabase
    .from('daily_reports')
    .select('status, users(full_name)')
    .gte('report_date', lastWeek.start)
    .lte('report_date', lastWeek.end)
  
  // Format dan kirim ke grup telegram direksi
}
```

### 3.4 Setup Cron Job (10 menit)
**External Service**: cron-job.org (Gratis)
- **Daily Reminder**: Setiap hari jam 15:55 WIB
- **Weekly Digest**: Setiap Senin jam 08:00 WIB
- **Keep-alive**: Setiap 3 hari (biar Supabase tidak pause)

---

## 🧪 **Phase 4: Testing & Production Prep (Estimasi: 45 Menit)**

### 4.1 End-to-End Testing (25 menit)
- [ ] Test arsip dokumen upload/download
- [ ] Test search & filter functionality  
- [ ] Test Telegram bot commands
- [ ] Test reminder notifications

### 4.2 Performance Optimization (10 menit)
- [ ] Add loading states
- [ ] Optimize image sizes
- [ ] Add error boundaries

### 4.3 Production Checklist (10 menit)
- [ ] Update environment variables
- [ ] Test webhook Vercel → Telegram
- [ ] Verify cron job triggers
- [ ] Update documentation

---

## 🎯 **Priority Order Hari 4:**

1. **Phase 1 (Arsip Dokumen)** - Medium priority, useful feature
2. **Phase 2 (Search & Filter)** - High priority, improves UX significantly  
3. **Phase 3 (Telegram Bot)** - High priority, automation & engagement
4. **Phase 4 (Testing)** - Critical, ensure stability

---

## 📋 **Final Checklist Hari 4:**

| # | Feature | Status |
|---|---------|--------|
| 1 | Upload/Download arsip dokumen per divisi | ⬜ |
| 2 | Search & filter laporan (staff & direksi) | ⬜ |
| 3 | Telegram bot setup & commands | ⬜ |
| 4 | Daily reminder automation | ⬜ |
| 5 | Weekly digest to direksi | ⬜ |
| 6 | End-to-end testing semua fitur | ⬜ |
| 7 | Production deployment & monitoring | ⬜ |

---

## 🚀 **Target Akhir Hari 4:**

**Sistem Mahira Tour 100% Complete dengan:**
- ✅ Semua core features working
- ✅ Arsip dokumen internal
- ✅ Search & filter powerful
- ✅ Telegram automation
- ✅ Production ready

**Next Steps (Optional Hari 5):**
- Advanced analytics & reporting
- Mobile app (React Native)
- Integration with other systems

---

> 💡 **Note**: Fokus pada quality & stability. Pastikan semua fitur yang sudah dibuat tetap working setelah menambahkan fitur baru. Test thoroughly sebelum declare "complete".

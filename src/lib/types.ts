// =====================
// Database Types
// =====================

export type UserRole = 'staff' | 'direksi'

export type TaskPriority = 'tinggi' | 'sedang' | 'rendah'

export type CompletionStatus = 'selesai' | 'dalam_proses' | 'tidak_selesai' | 'dibatalkan'

export type ReportStatus = 'draft' | 'submitted' | 'acknowledged'

export type AbsenceType = 'sakit' | 'cuti' | 'dinas_luar' | 'lainnya'

export type DocumentCategory = 'sop' | 'kontrak' | 'laporan' | 'template' | 'lainnya'

// =====================
// Table Row Types
// =====================

export interface Division {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  division_id: number | null
  telegram_id: string | null
  is_active: boolean
  created_at: string
  // Joined
  division?: Division
}

export interface Absence {
  id: number
  user_id: string
  absence_date: string
  type: AbsenceType
  reason: string | null
  created_at: string
  // Joined
  user?: User
}

export interface Announcement {
  id: number
  created_by: string
  title: string
  content: string
  target_division_id: number | null
  created_at: string
  // Joined
  author?: User
  target_division?: Division
  read_by_current_user?: boolean
}

export interface AnnouncementRead {
  id: number
  announcement_id: number
  user_id: string
  read_at: string
}

export interface DailyWorkPlan {
  id: number
  user_id: string
  division_id: number
  plan_date: string
  created_at: string
  // Joined
  user?: User
  division?: Division
  tasks?: PlanTask[]
  report?: DailyReport
}

export interface PlanTask {
  id: number
  plan_id: number
  title: string
  priority: TaskPriority
  source_task_id: number | null
  created_at: string
  // Joined
  update?: TaskUpdate
}

export interface DailyReport {
  id: number
  plan_id: number
  user_id: string
  division_id: number
  report_date: string
  status: ReportStatus
  submitted_at: string | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  // Joined
  user?: User
  division?: Division
  plan?: DailyWorkPlan
  task_updates?: TaskUpdate[]
  attachments?: ReportAttachment[]
  notes?: ReportNote[]
}

export interface TaskUpdate {
  id: number
  report_id: number
  plan_task_id: number
  completion_status: CompletionStatus
  notes: string | null
}

export interface ReportAttachment {
  id: number
  report_id: number
  file_path: string
  file_size: number | null
  file_type: string | null
  uploaded_at: string
}

export interface ReportNote {
  id: number
  report_id: number
  noted_by: string
  content: string
  created_at: string
  // Joined
  author?: User
}

export interface DivisionDocument {
  id: number
  division_id: number
  uploaded_by: string
  title: string
  category: DocumentCategory
  file_path: string
  file_size: number | null
  file_type: string | null
  description: string | null
  is_pinned: boolean
  created_at: string
  // Joined
  uploader?: User
  division?: Division
}

export interface MonthlyReport {
  id: number
  user_id: string
  division_id: number
  month: number
  year: number
  auto_generated_data: Record<string, unknown> | null
  achievements: string | null
  challenges: string | null
  next_month_plan: string | null
  status: ReportStatus
  submitted_at: string | null
  created_at: string
  // Joined
  user?: User
  division?: Division
}

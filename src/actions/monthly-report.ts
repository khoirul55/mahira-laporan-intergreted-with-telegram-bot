'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateMonthlyNarrative, type MonthlyRecapData } from '@/lib/gemini'

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export async function generateMonthlyReport(month: number, year: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, division_id, divisions(name)')
    .eq('id', user.id)
    .single()

  if (!userData?.division_id) return { error: 'Anda belum tergabung dalam divisi' }

  // Check existing
  const { data: existing } = await supabase
    .from('monthly_reports')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing?.status === 'submitted') return { error: 'Laporan bulan ini sudah disubmit' }

  // Calculate date range
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  // Get daily reports for the month
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('id, status, report_date, task_updates(completion_status, plan_tasks(title))')
    .eq('user_id', user.id)
    .gte('report_date', startDate)
    .lte('report_date', endDate)

  // Get absences
  const { data: absences } = await supabase
    .from('absences')
    .select('id')
    .eq('user_id', user.id)
    .gte('absence_date', startDate)
    .lte('absence_date', endDate)

  const totalSubmitted = reports?.filter(r => r.status === 'submitted').length || 0
  const totalAbsences = absences?.length || 0

  // Count working days (exclude weekends)
  let totalWorkDays = 0
  const d = new Date(startDate)
  while (d <= new Date(endDate) && d <= new Date()) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) totalWorkDays++
    d.setDate(d.getDate() + 1)
  }

  // Task breakdown
  const taskBreakdown = { selesai: 0, dalam_proses: 0, tidak_selesai: 0, dibatalkan: 0 }
  const allTaskTitles: string[] = []

  reports?.forEach(r => {
    const updates = (r as Record<string, unknown>).task_updates as { completion_status: string; plan_tasks: { title: string } | null }[] | null
    updates?.forEach(u => {
      const status = u.completion_status as keyof typeof taskBreakdown
      if (taskBreakdown[status] !== undefined) taskBreakdown[status]++
      if (u.plan_tasks?.title) allTaskTitles.push(u.plan_tasks.title)
    })
  })

  const completionRate = totalWorkDays - totalAbsences > 0
    ? Math.round((totalSubmitted / (totalWorkDays - totalAbsences)) * 100)
    : 0

  const autoData = {
    totalWorkDays,
    totalSubmitted,
    totalAbsences,
    completionRate: Math.min(100, completionRate),
    taskBreakdown,
    topTasks: [...new Set(allTaskTitles)].slice(0, 10),
  }

  // Generate AI narrative
  const division = (userData as Record<string, unknown>).divisions as { name: string } | null
  const recapData: MonthlyRecapData = {
    staffName: userData.full_name,
    divisionName: division?.name || '-',
    month: MONTH_NAMES[month],
    year,
    ...autoData,
  }

  const aiNarrative = await generateMonthlyNarrative(recapData)

  // Upsert monthly report
  if (existing) {
    const { error } = await supabase
      .from('monthly_reports')
      .update({
        auto_generated_data: autoData,
        achievements: aiNarrative.achievements || null,
        challenges: aiNarrative.challenges || null,
      })
      .eq('id', existing.id)

    if (error) return { error: error.message }

    revalidatePath('/beranda/laporan-bulanan')
    return { success: true, id: existing.id, autoData, aiNarrative }
  } else {
    const { data: newReport, error } = await supabase
      .from('monthly_reports')
      .insert({
        user_id: user.id,
        division_id: userData.division_id,
        month,
        year,
        auto_generated_data: autoData,
        achievements: aiNarrative.achievements || null,
        challenges: aiNarrative.challenges || null,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Laporan bulan ini sudah ada' }
      return { error: error.message }
    }

    revalidatePath('/beranda/laporan-bulanan')
    return { success: true, id: newReport.id, autoData, aiNarrative }
  }
}

export async function updateMonthlyNarrative(id: number, data: {
  achievements?: string
  challenges?: string
  next_month_plan?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('monthly_reports')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'draft')

  if (error) return { error: error.message }

  revalidatePath('/beranda/laporan-bulanan')
  return { success: true }
}

export async function submitMonthlyReport(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('monthly_reports')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'draft')

  if (error) return { error: error.message }

  revalidatePath('/beranda/laporan-bulanan')
  return { success: true }
}

export async function getMyMonthlyReport(month: number, year: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*, users(full_name), divisions(name)')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (error && error.code !== 'PGRST116') return { error: error.message }
  return { data }
}

export async function getAllMonthlyReports(month: number, year: number, divisionId?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('monthly_reports')
    .select('*, users(full_name), divisions(name)')
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })

  if (divisionId) query = query.eq('division_id', divisionId)

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getMonthlyReportById(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*, users(full_name), divisions(name)')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTodayWIB } from '@/lib/utils'

export type PlanTaskInput = {
  title: string
  priority: 'tinggi' | 'sedang' | 'rendah'
}

export async function createDailyPlan(tasks: PlanTaskInput[]) {
  if (!tasks || tasks.length === 0) {
    return { error: 'Rencana kerja tidak boleh kosong' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('division_id')
    .eq('id', user.id)
    .single()

  if (!userData?.division_id) {
    return { error: 'Anda belum tergabung dalam divisi apapun. Hubungi pimpinan.' }
  }

  const today = getTodayWIB() // 'YYYY-MM-DD'

  // 1. Create Daily Work Plan
  const { data: plan, error: planError } = await supabase
    .from('daily_work_plans')
    .insert([{ 
      user_id: user.id, 
      division_id: userData.division_id, 
      plan_date: today 
    }])
    .select()
    .single()

  if (planError) {
    if (planError.code === '23505') return { error: 'Rencana kerja hari ini sudah ada' }
    return { error: planError.message }
  }

  // 2. Insert Plan Tasks
  const tasksToInsert = tasks.map(t => ({
    plan_id: plan.id,
    title: t.title,
    priority: t.priority
  }))

  const { data: insertedTasks, error: tasksError } = await supabase
    .from('plan_tasks')
    .insert(tasksToInsert)
    .select()

  if (tasksError) {
    // Rollback is manual since we don't have rpc
    await supabase.from('daily_work_plans').delete().eq('id', plan.id)
    return { error: 'Gagal menyimpan tugas' }
  }

  // 3. Create Draft Daily Report
  const { data: report, error: reportError } = await supabase
    .from('daily_reports')
    .insert([{
      plan_id: plan.id,
      user_id: user.id,
      division_id: userData.division_id,
      report_date: today,
      status: 'draft'
    }])
    .select()
    .single()

  if (reportError) {
    await supabase.from('daily_work_plans').delete().eq('id', plan.id)
    return { error: 'Gagal membuat draft laporan' }
  }

  // 4. Create Task Updates (defaults)
  if (insertedTasks) {
    const updatesToInsert = insertedTasks.map(t => ({
      report_id: report.id,
      plan_task_id: t.id,
      completion_status: 'dalam_proses',
      notes: ''
    }))
    
    const { error: updatesError } = await supabase
      .from('task_updates')
      .insert(updatesToInsert)

    if (updatesError) {
      console.error("Error creating task updates defaults:", updatesError)
    }
  }

  revalidatePath('/beranda/laporan')
  return { success: true }
}

export type TaskUpdateInput = {
  update_id: number
  completion_status: 'selesai' | 'dalam_proses' | 'tidak_selesai' | 'dibatalkan'
  notes: string
}

export async function submitDailyReport(reportId: number, updates: TaskUpdateInput[], evidenceUrl?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify ownership
  const { data: report } = await supabase
    .from('daily_reports')
    .select('user_id, status')
    .eq('id', reportId)
    .single()

  if (report?.user_id !== user.id) return { error: 'Bukan laporan Anda' }
  if (report?.status === 'submitted') return { error: 'Laporan ini sudah disubmit' }

  // Update each task update
  for (const update of updates) {
    const { error } = await supabase
      .from('task_updates')
      .update({
        completion_status: update.completion_status,
        notes: update.notes
      })
      .eq('id', update.update_id)
      .eq('report_id', reportId) // extra safety
      
    if (error) return { error: `Gagal update tugas: ${error.message}` }
  }

  // Submit the report
  const { error: submitError } = await supabase
    .from('daily_reports')
    .update({ 
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      evidence_url: evidenceUrl || null
    })
    .eq('id', reportId)

  if (submitError) return { error: submitError.message }

  // Notify direksi via Telegram (non-blocking)
  notifyDireksiOnSubmit(user.id, reportId).catch(console.error)

  revalidatePath('/beranda/laporan')
  return { success: true }
}

async function notifyDireksiOnSubmit(userId: string, reportId: number) {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const { sendTelegramMessage, formatSubmitNotification } = await import('@/lib/telegram')
  const supabase = createAdminClient()

  // Get staff info
  const { data: staff } = await supabase
    .from('users')
    .select('full_name, divisions(name)')
    .eq('id', userId)
    .single()

  if (!staff) return

  // Get task completion info
  const { data: report } = await supabase
    .from('daily_reports')
    .select('report_date, task_updates(completion_status)')
    .eq('id', reportId)
    .single()

  const taskUpdates = (report as Record<string, unknown>)?.task_updates as { completion_status: string }[] | null
  const totalTasks = taskUpdates?.length || 0
  const completedTasks = taskUpdates?.filter(t => t.completion_status === 'selesai').length || 0

  // Get all direksi with telegram_id
  const { data: direksiList } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('role', 'direksi')
    .eq('is_active', true)
    .not('telegram_id', 'is', null)

  if (!direksiList || direksiList.length === 0) return

  const division = (staff as Record<string, unknown>).divisions as { name: string } | null
  const message = formatSubmitNotification({
    staffName: staff.full_name,
    divisionName: division?.name || '-',
    date: report?.report_date || getTodayWIB(),
    completedTasks,
    totalTasks,
  })

  await Promise.allSettled(
    direksiList.map(d => sendTelegramMessage(d.telegram_id!, message))
  )
}

export async function addDireksiNotes(reportId: number, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if direksi
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'direksi') {
    return { error: 'Hanya direksi yang bisa memberikan catatan' }
  }

  const { error } = await supabase
    .from('daily_reports')
    .update({ direksi_notes: notes })
    .eq('id', reportId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/laporan/${reportId}`)
  return { success: true }
}

export async function addAdhocTask(reportId: number, title: string, priority: 'tinggi' | 'sedang' | 'rendah') {
  if (!title.trim()) return { error: 'Judul tugas tidak boleh kosong' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Get the plan_id from the report
  const { data: report, error: reportError } = await supabase
    .from('daily_reports')
    .select('plan_id, user_id, status')
    .eq('id', reportId)
    .single()

  if (reportError || !report) return { error: 'Laporan tidak ditemukan' }
  if (report.user_id !== user.id) return { error: 'Bukan laporan Anda' }
  if (report.status === 'submitted') return { error: 'Laporan sudah disubmit, tidak bisa menambah tugas' }

  // 2. Insert into plan_tasks with is_adhoc = true
  const { data: insertedTask, error: taskError } = await supabase
    .from('plan_tasks')
    .insert([{
      plan_id: report.plan_id,
      title: title.trim(),
      priority,
      is_adhoc: true
    }])
    .select()
    .single()

  if (taskError) return { error: 'Gagal menambahkan tugas' }

  // 3. Insert into task_updates
  const { error: updateError } = await supabase
    .from('task_updates')
    .insert([{
      report_id: reportId,
      plan_task_id: insertedTask.id,
      completion_status: 'dalam_proses',
      notes: ''
    }])

  if (updateError) {
    // Rollback
    await supabase.from('plan_tasks').delete().eq('id', insertedTask.id)
    return { error: 'Gagal membuat status tugas' }
  }

  revalidatePath('/beranda/laporan')
  return { success: true }
}

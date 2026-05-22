import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFeedbackSuggestion, type FeedbackData } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Query daily report
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .select('report_date, user_id, users(full_name), task_updates(*, plan_tasks(title, priority))')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: reportError?.message || 'Report not found' }, { status: 404 })
    }

    // Assemble task items
    const tasks = ((report as any).task_updates || []).map((update: any) => ({
      title: update.plan_tasks?.title || 'Tugas Tanpa Judul',
      priority: update.plan_tasks?.priority || 'medium',
      status: update.completion_status,
      notes: update.notes || ''
    }))

    const completedCount = tasks.filter((t: any) => t.status === 'selesai').length
    const totalCount = tasks.length

    const feedbackData: FeedbackData = {
      staffName: (report as any).users?.full_name || 'Staff',
      reportDate: report.report_date || '',
      tasks,
      completedCount,
      totalCount
    }

    // Generate suggestion
    const suggestion = await generateFeedbackSuggestion(feedbackData)

    return NextResponse.json({ suggestion })
  } catch (error: any) {
    console.error('Error generating AI feedback:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

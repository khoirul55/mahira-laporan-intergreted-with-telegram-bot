import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage, formatReminderMessage } from '@/lib/telegram'
import { getTodayWIB } from '@/lib/utils'

// Endpoint untuk trigger daily reminder (dipanggil oleh cron-job.org)
export async function GET(request: NextRequest) {
  // Simple auth via query param
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = getTodayWIB()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://laporan.mahiratour.id'

  // Get all active staff with telegram_id
  const { data: allStaff } = await supabase
    .from('users')
    .select('id, full_name, telegram_id')
    .eq('role', 'staff')
    .eq('is_active', true)
    .not('telegram_id', 'is', null)

  if (!allStaff || allStaff.length === 0) {
    return NextResponse.json({ message: 'No staff with Telegram linked', sent: 0 })
  }

  // Get staff who are on leave today
  const { data: absences } = await supabase
    .from('absences')
    .select('user_id')
    .eq('absence_date', today)

  const absentIds = new Set((absences || []).map(a => a.user_id))

  // Get staff who already submitted
  const { data: submittedReports } = await supabase
    .from('daily_reports')
    .select('user_id')
    .eq('report_date', today)
    .eq('status', 'submitted')

  const submittedIds = new Set((submittedReports || []).map(r => r.user_id))

  // Filter: staff yang tidak izin DAN belum submit
  const needsReminder = allStaff.filter(
    s => !absentIds.has(s.id) && !submittedIds.has(s.id) && s.telegram_id
  )

  let sentCount = 0
  for (const staff of needsReminder) {
    try {
      await sendTelegramMessage(
        staff.telegram_id!,
        formatReminderMessage(staff.full_name, appUrl)
      )
      sentCount++
    } catch (err) {
      console.error(`Failed to send reminder to ${staff.full_name}:`, err)
    }
  }

  return NextResponse.json({
    message: `Daily reminder sent`,
    date: today,
    total_staff: allStaff.length,
    on_leave: absentIds.size,
    already_submitted: submittedIds.size,
    reminders_sent: sentCount,
  })
}

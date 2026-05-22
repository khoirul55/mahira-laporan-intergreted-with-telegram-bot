import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage, formatWeeklyDigest } from '@/lib/telegram'
import { generateWeeklyDigestNarrative, type WeeklyDigestData } from '@/lib/gemini'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Calculate last week's date range (Monday to Friday)
  const now = new Date()
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - now.getDay() - 6) // Previous Monday
  const lastFriday = new Date(lastMonday)
  lastFriday.setDate(lastMonday.getDate() + 4)

  const startDate = lastMonday.toISOString().split('T')[0]
  const endDate = lastFriday.toISOString().split('T')[0]
  const period = `${startDate} s/d ${endDate}`

  // Get all active staff
  const { data: allStaff } = await supabase
    .from('users')
    .select('id, full_name, division_id, divisions(name)')
    .eq('role', 'staff')
    .eq('is_active', true)

  const totalStaff = allStaff?.length || 0

  // Get reports for the week
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('user_id, status, report_date')
    .gte('report_date', startDate)
    .lte('report_date', endDate)
    .eq('status', 'submitted')

  // Get absences for the week
  const { data: absences } = await supabase
    .from('absences')
    .select('user_id, absence_date')
    .gte('absence_date', startDate)
    .lte('absence_date', endDate)

  // Calculate per-staff stats
  const staffSubmitCount: Record<string, number> = {}
  const staffAbsenceCount: Record<string, number> = {}

  reports?.forEach(r => {
    staffSubmitCount[r.user_id] = (staffSubmitCount[r.user_id] || 0) + 1
  })
  absences?.forEach(a => {
    staffAbsenceCount[a.user_id] = (staffAbsenceCount[a.user_id] || 0) + 1
  })

  const totalSubmitted = reports?.length || 0
  const totalOnLeave = absences?.length || 0
  // 5 work days * total staff = expected submissions
  const expectedTotal = totalStaff * 5
  const totalPending = expectedTotal - totalSubmitted - totalOnLeave
  const completionRate = expectedTotal > 0 ? Math.round((totalSubmitted / (expectedTotal - totalOnLeave)) * 100) : 0

  // Division stats
  const divisionMap: Record<string, { name: string; staffIds: string[] }> = {}
  allStaff?.forEach(s => {
    const div = (s as Record<string, unknown>).divisions as { name: string } | null
    const divName = div?.name || 'Tanpa Divisi'
    if (!divisionMap[divName]) divisionMap[divName] = { name: divName, staffIds: [] }
    divisionMap[divName].staffIds.push(s.id)
  })

  const divisionStats = Object.values(divisionMap).map(d => {
    const divSubmits = d.staffIds.reduce((sum, id) => sum + (staffSubmitCount[id] || 0), 0)
    const divAbsences = d.staffIds.reduce((sum, id) => sum + (staffAbsenceCount[id] || 0), 0)
    const divExpected = d.staffIds.length * 5
    const rate = divExpected - divAbsences > 0 ? Math.round((divSubmits / (divExpected - divAbsences)) * 100) : 0
    return { name: d.name, rate }
  })

  // Best staff & needs attention
  const bestStaff: string[] = []
  const needsAttention: string[] = []
  allStaff?.forEach(s => {
    const submits = staffSubmitCount[s.id] || 0
    const abs = staffAbsenceCount[s.id] || 0
    const expected = 5 - abs
    if (expected > 0 && submits >= expected) bestStaff.push(s.full_name)
    if (expected > 0 && submits < expected * 0.6) needsAttention.push(s.full_name)
  })

  // Try AI narrative first
  const digestData: WeeklyDigestData = {
    period, totalStaff, totalSubmitted, totalPending: Math.max(0, totalPending),
    totalOnLeave, completionRate: Math.min(100, completionRate),
    divisionStats, bestStaff: bestStaff.slice(0, 5), needsAttention: needsAttention.slice(0, 5),
  }

  let message = await generateWeeklyDigestNarrative(digestData)

  // Fallback to static format
  if (!message) {
    message = formatWeeklyDigest({
      period, totalStaff, submitted: totalSubmitted,
      pending: Math.max(0, totalPending), onLeave: totalOnLeave,
      completionRate: Math.min(100, completionRate),
    })
  }

  // Send to all direksi
  const { data: direksiList } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('role', 'direksi')
    .eq('is_active', true)
    .not('telegram_id', 'is', null)

  let sentCount = 0
  if (direksiList) {
    const results = await Promise.allSettled(
      direksiList.map(d => sendTelegramMessage(d.telegram_id!, message))
    )
    sentCount = results.filter(r => r.status === 'fulfilled').length
  }

  return NextResponse.json({
    message: 'Weekly digest sent',
    period,
    totalStaff,
    completionRate: Math.min(100, completionRate),
    sentTo: sentCount,
    aiGenerated: message.length > 200,
  })
}

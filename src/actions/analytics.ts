'use server'

import { createClient } from '@/lib/supabase/server'
import { generateAnalyticsInsight, type AnalyticsInsightData } from '@/lib/gemini'

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export async function getAnalyticsData(month: number, year: number) {
  const supabase = await createClient()

  // Get all users who are staff
  const { data: staffUsers, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, division_id, divisions(name)')
    .eq('role', 'staff')

  if (usersError || !staffUsers) {
    return { error: usersError?.message || 'Gagal memuat data staff' }
  }

  // Get monthly reports for that month/year
  const { data: monthlyReports, error: reportsError } = await supabase
    .from('monthly_reports')
    .select('*, users(full_name), divisions(name)')
    .eq('month', month)
    .eq('year', year)

  if (reportsError) {
    return { error: reportsError.message }
  }

  // Calc average completion rate
  let totalRate = 0
  let countWithRate = 0
  const leaderboard: { name: string; division: string; rate: number }[] = []

  monthlyReports?.forEach(r => {
    const auto = r.auto_generated_data as any
    if (auto && typeof auto.completionRate === 'number') {
      totalRate += auto.completionRate
      countWithRate++
      leaderboard.push({
        name: r.users?.full_name || 'Staff',
        division: r.divisions?.name || '-',
        rate: auto.completionRate
      })
    }
  })

  const avgCompletionRate = countWithRate > 0 ? Math.round(totalRate / countWithRate) : 0

  // Sort leaderboard descending
  leaderboard.sort((a, b) => b.rate - a.rate)

  // Get division stats
  const divisionMap: Record<string, { id: number; name: string; totalRate: number; staffCount: number }> = {}
  
  monthlyReports?.forEach(r => {
    const auto = r.auto_generated_data as any
    if (auto && typeof auto.completionRate === 'number' && r.divisions) {
      const dName = r.divisions.name
      if (!divisionMap[dName]) {
        divisionMap[dName] = { id: r.division_id, name: dName, totalRate: 0, staffCount: 0 }
      }
      divisionMap[dName].totalRate += auto.completionRate
      divisionMap[dName].staffCount++
    }
  })

  const divisionStats = Object.values(divisionMap).map(d => ({
    name: d.name,
    rate: Math.round(d.totalRate / d.staffCount),
    staffCount: d.staffCount
  }))

  // Weekly trend (CSS bar chart)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data: dailyReports } = await supabase
    .from('daily_reports')
    .select('report_date, status')
    .gte('report_date', startDate)
    .lte('report_date', endDate)
    .eq('status', 'submitted')

  const totalSubmittedByDate: Record<string, number> = {}
  dailyReports?.forEach(r => {
    if (r.report_date) {
      totalSubmittedByDate[r.report_date] = (totalSubmittedByDate[r.report_date] || 0) + 1
    }
  })

  // Group by week: W1 (1-7), W2 (8-14), W3 (15-21), W4 (22-end)
  const weeklyCounts = [0, 0, 0, 0]
  const weeklyActiveDays = [0, 0, 0, 0]

  const totalStaff = staffUsers.length

  const d = new Date(startDate)
  while (d <= new Date(endDate) && d <= new Date()) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) { // working day
      const dateStr = d.toISOString().split('T')[0]
      const dom = d.getDate()
      const wIdx = dom <= 7 ? 0 : dom <= 14 ? 1 : dom <= 21 ? 2 : 3
      weeklyCounts[wIdx] += totalSubmittedByDate[dateStr] || 0
      weeklyActiveDays[wIdx]++
    }
    d.setDate(d.getDate() + 1)
  }

  const weeklyTrend = weeklyCounts.map((submittedCount, idx) => {
    const activeDays = weeklyActiveDays[idx]
    const potentialReports = activeDays * totalStaff
    const rate = potentialReports > 0 ? Math.round((submittedCount / potentialReports) * 100) : 0
    return {
      label: `Minggu ${idx + 1}`,
      rate: Math.min(100, rate)
    }
  })

  // Performers list
  const topPerformers = leaderboard.filter(l => l.rate >= 90).map(l => l.name)
  const lowPerformers = leaderboard.filter(l => l.rate < 60).map(l => l.name)

  return {
    avgCompletionRate,
    leaderboard,
    divisionStats,
    weeklyTrend,
    topPerformers,
    lowPerformers,
    totalStaff
  }
}

export async function getAIInsight(month: number, year: number) {
  const data = await getAnalyticsData(month, year)
  if ('error' in data) return { error: data.error }

  const lastWeekRate = data.weeklyTrend[3]?.rate || 0
  const firstWeekRate = data.weeklyTrend[0]?.rate || 0
  const trendDirection = lastWeekRate > firstWeekRate ? 'up' : lastWeekRate < firstWeekRate ? 'down' : 'stable'

  const insightData: AnalyticsInsightData = {
    month: MONTH_NAMES[month],
    year,
    avgCompletionRate: data.avgCompletionRate,
    trendDirection,
    divisionStats: data.divisionStats,
    topPerformers: data.topPerformers.slice(0, 3),
    lowPerformers: data.lowPerformers.slice(0, 3)
  }

  const insight = await generateAnalyticsInsight(insightData)
  return { insight }
}

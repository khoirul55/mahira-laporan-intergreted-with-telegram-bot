const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set')
    return ''
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!res.ok) {
      console.error('Gemini API error:', res.status, await res.text())
      return ''
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (error) {
    console.error('Gemini API call failed:', error)
    return ''
  }
}

// ─── Monthly Report Narrative ──────────────────────────
export interface MonthlyRecapData {
  staffName: string
  divisionName: string
  month: string
  year: number
  totalWorkDays: number
  totalSubmitted: number
  totalAbsences: number
  completionRate: number
  taskBreakdown: { selesai: number; dalam_proses: number; tidak_selesai: number; dibatalkan: number }
  topTasks: string[]
}

export async function generateMonthlyNarrative(data: MonthlyRecapData): Promise<{
  achievements: string
  challenges: string
  recommendations: string
}> {
  const prompt = `Kamu adalah asisten HR di perusahaan travel Mahira Tour. Buatkan narasi laporan bulanan dalam Bahasa Indonesia berdasarkan data berikut:

Staff: ${data.staffName}
Divisi: ${data.divisionName}
Periode: ${data.month} ${data.year}
Total Hari Kerja: ${data.totalWorkDays}
Laporan Disubmit: ${data.totalSubmitted}
Izin: ${data.totalAbsences}
Completion Rate: ${data.completionRate}%
Breakdown Tugas: Selesai ${data.taskBreakdown.selesai}, Dalam Proses ${data.taskBreakdown.dalam_proses}, Tidak Selesai ${data.taskBreakdown.tidak_selesai}, Dibatalkan ${data.taskBreakdown.dibatalkan}
Tugas Utama: ${data.topTasks.join(', ')}

Berikan output HANYA dalam format JSON (tanpa markdown code block):
{"achievements":"[2-3 kalimat pencapaian]","challenges":"[2-3 kalimat tantangan]","recommendations":"[2-3 kalimat rekomendasi]"}`

  const result = await callGemini(prompt)
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      achievements: result || 'Tidak dapat di-generate otomatis.',
      challenges: '',
      recommendations: '',
    }
  }
}

// ─── Weekly Digest Narrative ───────────────────────────
export interface WeeklyDigestData {
  period: string
  totalStaff: number
  totalSubmitted: number
  totalPending: number
  totalOnLeave: number
  completionRate: number
  divisionStats: { name: string; rate: number }[]
  bestStaff: string[]
  needsAttention: string[]
}

export async function generateWeeklyDigestNarrative(data: WeeklyDigestData): Promise<string> {
  const prompt = `Kamu adalah asisten pimpinan di Mahira Tour. Buatkan ringkasan mingguan singkat (maks 200 kata) dalam Bahasa Indonesia untuk dikirim via Telegram.

Periode: ${data.period}
Total Staff: ${data.totalStaff}
Submit Tepat Waktu: ${data.totalSubmitted}
Belum Submit: ${data.totalPending}
Izin: ${data.totalOnLeave}
Completion Rate: ${data.completionRate}%
Per Divisi: ${data.divisionStats.map(d => `${d.name}: ${d.rate}%`).join(', ')}
Staff Terbaik: ${data.bestStaff.join(', ') || '-'}
Perlu Perhatian: ${data.needsAttention.join(', ') || '-'}

Format dengan emoji, ringkas, profesional. Langsung tulis teksnya tanpa code block.`

  return await callGemini(prompt)
}

// ─── Analytics Insight ─────────────────────────────────
export interface AnalyticsInsightData {
  month: string
  year: number
  avgCompletionRate: number
  trendDirection: 'up' | 'down' | 'stable'
  divisionStats: { name: string; rate: number; staffCount: number }[]
  topPerformers: string[]
  lowPerformers: string[]
}

export async function generateAnalyticsInsight(data: AnalyticsInsightData): Promise<string> {
  const prompt = `Kamu adalah analis data di Mahira Tour. Berikan insight singkat (maks 150 kata) dalam Bahasa Indonesia:

Periode: ${data.month} ${data.year}
Rata-rata Completion Rate: ${data.avgCompletionRate}%
Tren: ${data.trendDirection}
Per Divisi: ${data.divisionStats.map(d => `${d.name}: ${d.rate}% (${d.staffCount} staff)`).join(', ')}
Top Performers: ${data.topPerformers.join(', ')}
Perlu Perhatian: ${data.lowPerformers.join(', ')}

Berikan: 1) Ringkasan tren, 2) Highlight positif, 3) Area perhatian, 4) Saran aksi. Format dengan emoji, ringkas.`

  return await callGemini(prompt)
}

// ─── Feedback Suggestion ───────────────────────────────
export interface FeedbackData {
  staffName: string
  reportDate: string
  tasks: { title: string; priority: string; status: string; notes: string }[]
  completedCount: number
  totalCount: number
}

export async function generateFeedbackSuggestion(data: FeedbackData): Promise<string> {
  const prompt = `Kamu adalah pimpinan di Mahira Tour. Buatkan feedback singkat (3-5 kalimat) dalam Bahasa Indonesia untuk laporan harian staff:

Staff: ${data.staffName}
Tanggal: ${data.reportDate}
Tugas (${data.completedCount}/${data.totalCount} selesai):
${data.tasks.map(t => `- ${t.title} [${t.priority}] → ${t.status}${t.notes ? `: ${t.notes}` : ''}`).join('\n')}

Berikan feedback yang konstruktif, profesional, dan supportif. Langsung tulis feedbacknya tanpa code block.`

  return await callGemini(prompt)
}

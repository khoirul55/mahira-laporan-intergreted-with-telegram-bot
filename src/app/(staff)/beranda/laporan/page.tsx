import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, FileCheck2, ShieldAlert, MessageSquare } from 'lucide-react'
import { getTodayWIB } from '@/lib/utils'
import { CreatePlanForm, UpdateReportForm } from './report-forms'
import { Badge } from '@/components/ui/badge'

export default async function LaporanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = getTodayWIB()

  // 1. Cek apakah hari ini sedang izin Sakit / Cuti
  const { data: izinHariIni } = await supabase
    .from('absences')
    .select('type')
    .eq('user_id', user.id)
    .eq('absence_date', today)
    .in('type', ['sakit', 'cuti'])
    .single()

  if (izinHariIni) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <Header />
          <div className="p-8 text-center bg-card border border-amber-500/20 rounded-xl">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-400">Form Laporan Terkunci</h2>
            <p className="text-muted-foreground mt-2">
              Anda tercatat sedang mengambil izin <b>{izinHariIni.type.toUpperCase()}</b> hari ini. 
              Selamat beristirahat, tidak perlu mengisi laporan harian.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 2. Cek Overdue Report (Laporan kemarin yang masih draft)
  const { data: overdueReports } = await supabase
    .from('daily_reports')
    .select('id, report_date, plan:daily_work_plans(plan_tasks(*)), task_updates(*, plan_task:plan_tasks(*))')
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .lt('report_date', today)
    .order('report_date', { ascending: true })

  if (overdueReports && overdueReports.length > 0) {
    const overdue = overdueReports[0]
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <Header />
          <div className="p-6 bg-rose-950/20 border border-rose-500/20 rounded-xl mb-6">
            <div className="flex gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold">Laporan Tertunda!</h3>
                <p className="text-sm mt-1">
                  Anda belum mensubmit laporan untuk tanggal <b>{overdue.report_date}</b>. 
                  Selesaikan laporan di bawah ini untuk membuka akses rencana kerja hari ini.
                </p>
              </div>
            </div>
          </div>
          <UpdateReportForm report={overdue} updates={overdue.task_updates} />
        </div>
      </div>
    )
  }

  // 3. Cek Rencana & Laporan Hari Ini
  const { data: todayReport } = await supabase
    .from('daily_reports')
    .select('id, status, direksi_notes, evidence_url, plan:daily_work_plans(plan_tasks(*)), task_updates(*, plan_task:plan_tasks(*))')
    .eq('user_id', user.id)
    .eq('report_date', today)
    .single()

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Header />

        {!todayReport ? (
          // Skenario Pagi: Belum buat rencana
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold">1. Rencana Kerja Pagi 🌅</h2>
              <p className="text-muted-foreground text-sm mt-1">Masukkan target pekerjaan yang akan Anda selesaikan hari ini.</p>
            </div>
            <CreatePlanForm />
          </div>
        ) : todayReport.status === 'draft' ? (
          // Skenario Sore: Sudah buat rencana, belum submit
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold">2. Laporan Akhir Hari 🌇</h2>
              <p className="text-muted-foreground text-sm mt-1">Tandai status penyelesaian dari target Anda tadi pagi.</p>
            </div>
            <UpdateReportForm report={todayReport} updates={todayReport.task_updates} />
          </div>
        ) : (
          // Skenario Malam: Sudah disubmit
          <div>
            <div className="p-8 text-center bg-emerald-950/20 border border-emerald-500/20 rounded-xl mb-8">
              <FileCheck2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-emerald-400">Laporan Telah Disubmit</h2>
              <p className="text-muted-foreground mt-2">
                Terima kasih atas kerja keras Anda hari ini! Laporan Anda sudah tercatat dan dapat dilihat oleh Pimpinan.
              </p>
            </div>

              <h3 className="font-bold text-foreground/80 mb-4">Ringkasan Hari Ini:</h3>
              <div className="space-y-4">
              {todayReport.task_updates.map((update: any, idx: number) => (
                <div key={update.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{update.plan_task.title}</h4>
                    {update.notes && <p className="text-sm text-muted-foreground mt-1 italic">"{update.notes}"</p>}
                  </div>
                  <div>
                    <Badge variant="outline" className={
                      update.completion_status === 'selesai' ? 'text-emerald-400 border-emerald-400' :
                      update.completion_status === 'dalam_proses' ? 'text-amber-400 border-amber-400' :
                      'text-rose-400 border-rose-400'
                    }>
                      {update.completion_status === 'selesai' ? '✅ Selesai' :
                       update.completion_status === 'dalam_proses' ? '🔄 Dalam Proses' :
                       update.completion_status === 'tidak_selesai' ? '❌ Tidak Selesai' :
                       '🚫 Dibatalkan'}
                    </Badge>
                  </div>
                </div>
              ))}
              </div>

              {todayReport.evidence_url && (
                <div className="mt-6 p-4 rounded-xl border border-border bg-card">
                  <h4 className="font-medium text-foreground/80 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Bukti Foto Laporan
                  </h4>
                  <img 
                    src={todayReport.evidence_url} 
                    alt="Bukti Laporan" 
                    className="max-w-full md:max-w-md rounded-lg border border-border"
                  />
                </div>
              )}

            {todayReport.direksi_notes && (
              <div className="mt-8 p-6 bg-card border border-emerald-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Feedback Pimpinan
                </h3>
                <p className="text-foreground/80 whitespace-pre-wrap">{todayReport.direksi_notes}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function Header() {
  return (
    <div>
      <Link href="/beranda" className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Beranda
      </Link>
      <h1 className="text-3xl font-bold">Laporan Harian</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Dokumentasikan rencana dan capaian kerja Anda setiap hari.
      </p>
    </div>
  )
}

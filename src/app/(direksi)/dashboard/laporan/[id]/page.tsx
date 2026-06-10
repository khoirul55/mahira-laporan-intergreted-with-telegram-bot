import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, CheckCircle2, Clock, FileText, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DireksiFeedbackForm } from './feedback-form'

export default async function DetailLaporanPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'direksi') {
    redirect('/beranda')
  }

  // Fetch report detail
  const { data: report } = await supabase
    .from('daily_reports')
    .select(`
      id, 
      status, 
      report_date, 
      submitted_at, 
      direksi_notes,
      evidence_url,
      user:users!user_id(full_name, division:divisions(name)),
      task_updates(*, plan_task:plan_tasks(*))
    `)
    .eq('id', params.id)
    .single()

  if (!report) {
    return (
      <div className="p-6 md:p-10">
        <Link href="/dashboard/laporan" className="inline-flex items-center text-sm text-secondary-foreground hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Laporan
        </Link>
        <div className="p-8 text-center bg-card border border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary-foreground">Laporan Tidak Ditemukan</h2>
          <p className="text-muted-foreground mt-2">Laporan yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
        </div>
      </div>
    )
  }

  const staffName = (report.user as any)?.full_name || 'Tanpa Nama'
  const divisionName = (report.user as any)?.division?.name || 'Tanpa Divisi'
  
  const isSubmitted = report.status === 'submitted'
  const dateStr = new Date(report.report_date).toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  })

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <Link href="/dashboard/laporan" className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Pantau Laporan
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Detail Laporan Harian</h1>
        <p className="text-secondary-foreground text-sm mt-1">
          Tinjau capaian kerja staff dan berikan feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-secondary-foreground">Staff</p>
            <p className="font-semibold">{staffName}</p>
            <p className="text-xs text-muted-foreground">{divisionName}</p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-secondary-foreground">Tanggal Laporan</p>
            <p className="font-semibold">{dateStr}</p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            {isSubmitted ? <CheckCircle2 className="w-5 h-5 text-purple-400" /> : <Clock className="w-5 h-5 text-purple-400" />}
          </div>
          <div>
            <p className="text-sm text-secondary-foreground">Status</p>
            <Badge variant="outline" className={isSubmitted ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10 mt-1" : "text-amber-400 border-amber-400/20 bg-amber-400/10 mt-1"}>
              {isSubmitted ? '✅ Sudah Submit' : '🔄 Draft (Belum Submit)'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-bold border-b border-border pb-2">Rincian Tugas & Capaian</h3>
        
        {(!report.task_updates || report.task_updates.length === 0) ? (
          <div className="p-4 text-center text-muted-foreground bg-card rounded-xl border border-border">
            Belum ada rencana kerja yang diisi.
          </div>
        ) : (
          <div className="space-y-4">
            {report.task_updates.map((update: any) => (
              <div key={update.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{update.plan_task.title}</h4>
                    {update.plan_task.priority === 'tinggi' && <Badge variant="destructive" className="h-5 text-[10px]">Tinggi</Badge>}
                  </div>
                  {update.notes ? (
                    <p className="text-sm text-secondary-foreground mt-2 bg-card p-2 rounded-md border border-border">
                      <span className="text-xs text-muted-foreground block mb-1">Catatan Staff:</span>
                      {update.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 italic">Tidak ada catatan.</p>
                  )}
                </div>
                <div className="shrink-0 pt-1">
                  <Badge variant="outline" className={
                    update.completion_status === 'selesai' ? 'text-emerald-400 border-emerald-400/30' :
                    update.completion_status === 'dalam_proses' ? 'text-amber-400 border-amber-400/30' :
                    'text-rose-400 border-rose-400/30'
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
        )}
      </div>

      {report.evidence_url && (
        <div className="mb-8 p-6 bg-card border border-border rounded-xl">
          <h3 className="text-xl font-bold border-b border-border pb-2 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            Bukti Foto Laporan
          </h3>
          <div className="mt-4">
            <a href={report.evidence_url} target="_blank" rel="noreferrer" className="block w-full max-w-lg overflow-hidden rounded-xl border border-border hover:border-emerald-500 transition-colors">
              <img 
                src={report.evidence_url} 
                alt="Bukti Laporan Staff" 
                className="w-full h-auto object-cover"
              />
            </a>
            <p className="text-muted-foreground text-sm mt-2">Klik gambar untuk melihat resolusi penuh</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <DireksiFeedbackForm reportId={report.id} initialNotes={report.direksi_notes} />
      </div>

    </div>
  )
}

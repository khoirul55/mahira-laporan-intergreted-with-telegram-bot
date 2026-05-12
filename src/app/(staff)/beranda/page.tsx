import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Megaphone, FileText, Calendar, FolderOpen, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { LogoutButton } from './logout-button'

function getTodayStatus(reports: any[], plans: any[]) {
  const today = new Date().toISOString().split('T')[0]
  const report = reports?.find(r => r.report_date === today)
  const plan = plans?.find(p => p.plan_date === today)

  if (report?.status === 'submitted') {
    return { label: 'Laporan Sudah Dikirim', color: 'emerald', icon: 'check' }
  }
  if (plan) {
    return { label: 'Rencana Dibuat — Laporan Belum Dikirim', color: 'amber', icon: 'clock' }
  }
  return { label: 'Belum Ada Aktivitas Hari Ini', color: 'red', icon: 'alert' }
}

function formatTanggal() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default async function BerandaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role, division:divisions(name)')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: reports }, { data: plans }, { data: announcements }] = await Promise.all([
    supabase.from('daily_reports').select('report_date, status').eq('user_id', user.id),
    supabase.from('daily_work_plans').select('plan_date').eq('user_id', user.id),
    supabase.from('announcements')
      .select('*, author:users!created_by(full_name)')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const status = getTodayStatus(reports || [], plans || [])
  const divisionName = ((userData?.division as unknown) as { name: string } | null)?.name

  const statusConfig = ({
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400' },
    red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     dot: 'bg-red-400' },
  } as const)[status.color as 'emerald' | 'amber' | 'red'] ?? {
    bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400'
  }

  const quickLinks = [
    {
      href: '/beranda/laporan',
      icon: FileText,
      label: 'Laporan Harian',
      desc: 'Isi rencana kerja dan update laporan akhir hari',
      accent: 'emerald',
    },
    {
      href: '/beranda/izin',
      icon: Calendar,
      label: 'Izin / Absen',
      desc: 'Ajukan sakit, cuti, atau dinas luar',
      accent: 'blue',
    },
    {
      href: '/beranda/arsip',
      icon: FolderOpen,
      label: 'Arsip Dokumen',
      desc: 'Upload dan kelola dokumen divisi',
      accent: 'violet',
    },
  ]

  const accentMap: Record<string, string> = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 group-hover:text-emerald-400',
    blue: 'border-blue-500/20 hover:border-blue-500/40 group-hover:text-blue-400',
    violet: 'border-violet-500/20 hover:border-violet-500/40 group-hover:text-violet-400',
  }

  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 capitalize">{formatTanggal()}</p>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              Halo, {userData?.full_name?.split(' ')[0] || 'Staff'} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {divisionName || 'Belum ada divisi'} · Staff
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Status Laporan Hari Ini */}
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot} ${status.color === 'amber' ? 'animate-pulse' : ''}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Status Hari Ini</p>
            <p className={`text-sm font-medium ${statusConfig.text}`}>{status.label}</p>
          </div>
          <Link href="/beranda/laporan" className={`text-xs ${statusConfig.text} hover:opacity-80 flex-shrink-0`}>
            Buka →
          </Link>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          {quickLinks.map(({ href, icon: Icon, label, desc, accent }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 p-4 rounded-xl bg-card border transition-all duration-200 ${accentMap[accent]}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorMap[accent]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-foreground transition-colors ${accentMap[accent]}`}>{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Pengumuman */}
        {announcements && announcements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-foreground">Pengumuman</h2>
            </div>
            <div className="space-y-2.5">
              {announcements.map((ann) => (
                <div key={ann.id} className="relative p-4 bg-card border border-border rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-400" />
                  <h4 className="font-semibold text-sm text-foreground mb-1">{ann.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(ann.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })} · {(ann.author as any)?.full_name || 'Sistem'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

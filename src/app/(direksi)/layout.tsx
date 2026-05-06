import Link from 'next/link'
import { LogoutButton } from '../(staff)/beranda/logout-button'
import { LayoutDashboard, Users, Folders, CalendarDays, FileText } from 'lucide-react'

export default function DireksiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Mahira Tour
          </h2>
          <p className="text-xs text-slate-400 mt-1">Sistem Laporan Terintegrasi</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link
            href="/dashboard/divisions"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Folders className="w-4 h-4" />
            Divisi
          </Link>
          <Link
            href="/dashboard/laporan"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Pantau Laporan
          </Link>
          <Link
            href="/dashboard/users"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            User & Staff
          </Link>
          <Link
            href="/dashboard/absences"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            Rekap Izin
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h2 className="text-lg font-bold text-emerald-400">Mahira Tour</h2>
          <LogoutButton />
        </div>
        
        {children}
      </main>
    </div>
  )
}

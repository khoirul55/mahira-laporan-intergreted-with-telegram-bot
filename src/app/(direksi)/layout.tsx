'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogoutButton } from '../(staff)/beranda/logout-button'
import {
  LayoutDashboard, Users, Folders, CalendarDays,
  FileText, Megaphone, FolderOpen, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/divisions', label: 'Divisi', icon: Folders },
  { href: '/dashboard/laporan', label: 'Pantau Laporan', icon: FileText },
  { href: '/dashboard/pengumuman', label: 'Pengumuman', icon: Megaphone },
  { href: '/dashboard/users', label: 'User & Staff', icon: Users },
  { href: '/dashboard/absences', label: 'Rekap Izin', icon: CalendarDays },
  { href: '/dashboard/arsip', label: 'Arsip Dokumen', icon: FolderOpen },
]

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
            {label}
          </Link>
        )
      })}
    </>
  )
}

export default function DireksiLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Desktop */}
      <aside className="w-60 border-r border-border bg-card flex-col hidden md:flex flex-shrink-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">Mahira Tour</h2>
              <p className="text-xs text-muted-foreground leading-tight">Pimpinan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <NavLinks />
        </nav>

        <div className="p-3 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 md:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-sm font-bold text-foreground">Mahira Tour</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks onClose={() => setDrawerOpen(false)} />
        </nav>
        <div className="p-3 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">Mahira Tour</span>
          <LogoutButton />
        </div>

        {children}
      </main>
    </div>
  )
}

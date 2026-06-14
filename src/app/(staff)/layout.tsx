'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Calendar, FolderOpen, User } from 'lucide-react'
import { LogoutButton } from './beranda/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/beranda', label: 'Beranda', icon: Home, exact: true },
  { href: '/beranda/laporan', label: 'Laporan', icon: FileText, exact: false },
  { href: '/beranda/izin', label: 'Izin', icon: Calendar, exact: false },
  { href: '/beranda/arsip', label: 'Arsip', icon: FolderOpen, exact: false },
  { href: '/beranda/profil', label: 'Profil', icon: User, exact: false },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar — Desktop Only */}
      <aside className="w-56 border-r border-border bg-card flex-col hidden md:flex flex-shrink-0">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">Mahira Tour</h2>
              <p className="text-xs text-muted-foreground leading-tight">Staff Panel</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
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
          </div>
        </nav>

        <div className="p-3 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Content — padding bottom for mobile nav */}
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom Navigation — Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[60px] transition-all duration-150 ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative p-1.5 rounded-lg transition-all duration-150 ${
                  isActive ? 'bg-emerald-500/15' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-emerald-400' : ''}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

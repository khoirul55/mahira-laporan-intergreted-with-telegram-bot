'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Calendar, FolderOpen, User } from 'lucide-react'

const bottomNav = [
  { href: '/beranda', label: 'Beranda', icon: Home, exact: true },
  { href: '/beranda/laporan', label: 'Laporan', icon: FileText, exact: false },
  { href: '/beranda/izin', label: 'Izin', icon: Calendar, exact: false },
  { href: '/beranda/arsip', label: 'Arsip', icon: FolderOpen, exact: false },
  { href: '/beranda/profil', label: 'Profil', icon: User, exact: false },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Content — padding bottom for mobile nav */}
      <div className="pb-20 md:pb-0">
        {children}
      </div>

      {/* Bottom Navigation — Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {bottomNav.map(({ href, label, icon: Icon, exact }) => {
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

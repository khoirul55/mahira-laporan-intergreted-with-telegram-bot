import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*, division:divisions(*)')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'MahiraTourBot'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Profil Saya</h1>

      {/* Info User */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informasi Akun</h2>
        <div className="grid gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Nama Lengkap</p>
            <p className="font-medium">{user.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Divisi</p>
            <p className="font-medium">{user.division?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Telegram Link */}
      <ProfileClient
        userId={user.id}
        telegramId={user.telegram_id}
        botUsername={botUsername}
      />
    </div>
  )
}

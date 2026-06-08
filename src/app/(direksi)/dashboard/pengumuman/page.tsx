import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreateAnnouncementForm, DeleteAnnouncementButton } from './announcement-form'
import { deleteAnnouncement } from '@/actions/announcement'

export default async function PengumumanPage() {
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

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, author:users!created_by(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-amber-500" />
            Papan Pengumuman
          </h1>
          <p className="text-secondary-foreground text-sm mt-1">
            Buat pengumuman atau broadcast informasi penting ke seluruh staff.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CreateAnnouncementForm />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Riwayat Pengumuman</h3>
          
          {!announcements || announcements.length === 0 ? (
            <div className="p-8 text-center bg-card border border-border rounded-xl text-foreground0">
              Belum ada pengumuman yang dibuat.
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="p-5 bg-card border border-border rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-foreground">{ann.title}</h4>
                  <DeleteAnnouncementButton id={ann.id} />
                </div>
                <p className="text-secondary-foreground text-sm whitespace-pre-wrap mb-4">{ann.content}</p>
                <div className="flex items-center gap-3 text-xs text-foreground0">
                  <Badge variant="secondary" className="bg-muted text-secondary-foreground hover:bg-muted">
                    Oleh: {(ann.author as any)?.full_name || 'Sistem'}
                  </Badge>
                  <span>•</span>
                  <span>{new Date(ann.created_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

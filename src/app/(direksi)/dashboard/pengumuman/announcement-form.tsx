'use client'

import { useRef, useState } from 'react'
import { createAnnouncement, deleteAnnouncement } from '@/actions/announcement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Plus, Trash2, Loader2 } from 'lucide-react'

export function CreateAnnouncementForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirm('Apakah Anda yakin ingin menyebarkan pengumuman ini ke seluruh staff?')) return
    
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const res = await createAnnouncement(formData)
    setIsPending(false)
    
    if (res?.error) {
      toast.error('Gagal membuat pengumuman', { description: res.error })
    } else {
      toast.success('Pengumuman berhasil di-broadcast!')
      formRef.current?.reset()
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-6">
      <div className="p-4 border-b border-border bg-card flex items-center gap-2">
        <Plus className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">Buat Pengumuman Baru</h3>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary-foreground mb-1">Judul Pengumuman</label>
          <Input 
            id="title" 
            name="title" 
            placeholder="Contoh: Libur Nasional Idul Fitri" 
            required 
            className="bg-card border-border"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-secondary-foreground mb-1">Isi Pengumuman</label>
          <Textarea 
            id="content" 
            name="content" 
            placeholder="Tuliskan pesan yang ingin disampaikan..." 
            required 
            className="min-h-[150px] bg-card border-border"
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {isPending ? 'Mengirim...' : 'Broadcast Sekarang'}
        </Button>
      </form>
    </div>
  )
}

export function DeleteAnnouncementButton({ id }: { id: number }) {
  const [isPending, setIsPending] = useState(false)

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isPending}
      onClick={async () => {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
        setIsPending(true)
        const res = await deleteAnnouncement(id)
        setIsPending(false)
        if (res?.error) {
          toast.error('Gagal menghapus pengumuman', { description: res.error })
        } else {
          toast.success('Pengumuman berhasil dihapus')
        }
      }}
      className="text-foreground0 hover:text-rose-400 hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-opacity">
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}

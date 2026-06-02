'use client'

import { useRef } from 'react'
import { createAnnouncement } from '@/actions/announcement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Plus } from 'lucide-react'

export function CreateAnnouncementForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function action(formData: FormData) {
    const res = await createAnnouncement(formData)
    if (res.error) {
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
      <form ref={formRef} action={action} className="p-5 space-y-4">
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
        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          <Send className="w-4 h-4 mr-2" />
          Broadcast Sekarang
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { addDireksiNotes } from '@/actions/report'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageSquare, Save, Loader2 } from 'lucide-react'

export function DireksiFeedbackForm({ 
  reportId, 
  initialNotes 
}: { 
  reportId: number
  initialNotes: string | null 
}) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const res = await addDireksiNotes(reportId, notes)

    if (res.error) {
      toast.error('Gagal menyimpan feedback', { description: res.error })
    } else {
      toast.success('Feedback berhasil disimpan')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-slate-200">Feedback / Catatan Pimpinan</h3>
      </div>
      <div className="p-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan komentar, evaluasi, atau arahan untuk laporan ini..."
          className="min-h-[120px] bg-slate-950 border-slate-800 focus-visible:ring-emerald-500/50"
        />
        <div className="mt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || notes === initialNotes}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Feedback
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

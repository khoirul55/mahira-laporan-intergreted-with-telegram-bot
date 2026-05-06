'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDailyPlan, submitDailyReport, PlanTaskInput, TaskUpdateInput } from '@/actions/report'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CreatePlanForm() {
  const [tasks, setTasks] = useState<PlanTaskInput[]>([{ title: '', priority: 'sedang' }])
  const [loading, setLoading] = useState(false)

  const addTask = () => {
    setTasks([...tasks, { title: '', priority: 'sedang' }])
  }

  const removeTask = (index: number) => {
    if (tasks.length === 1) return
    const newTasks = [...tasks]
    newTasks.splice(index, 1)
    setTasks(newTasks)
  }

  const updateTask = (index: number, field: keyof PlanTaskInput, value: string) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], [field]: value } as PlanTaskInput
    setTasks(newTasks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (tasks.some(t => !t.title.trim())) {
      toast.error('Judul tugas tidak boleh kosong')
      return
    }

    setLoading(true)
    const res = await createDailyPlan(tasks)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Rencana kerja berhasil disimpan')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Tugas {idx + 1}</Label>
                <Input 
                  value={task.title}
                  onChange={(e) => updateTask(idx, 'title', e.target.value)}
                  placeholder="Deskripsikan tugas..." 
                  className="bg-slate-950 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select value={task.priority} onValueChange={(val) => updateTask(idx, 'priority', val as any)}>
                  <SelectTrigger className="bg-slate-950 border-slate-700 w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="tinggi">🔴 Tinggi</SelectItem>
                    <SelectItem value="sedang">🟡 Sedang</SelectItem>
                    <SelectItem value="rendah">🟢 Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {tasks.length > 1 && (
              <Button type="button" onClick={() => removeTask(idx)} variant="ghost" size="icon" className="text-slate-500 hover:text-rose-400 mt-8">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="button" onClick={addTask} variant="outline" className="border-slate-700 text-emerald-400 hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" /> Tambah Baris Tugas
        </Button>
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? 'Menyimpan...' : 'Simpan Rencana Kerja'}
        </Button>
      </div>
    </form>
  )
}


export function UpdateReportForm({ report, updates }: { report: any, updates: any[] }) {
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdateInput[]>(
    updates.map(u => ({
      update_id: u.id,
      completion_status: u.completion_status,
      notes: u.notes || ''
    }))
  )
  const [loading, setLoading] = useState(false)

  const handleUpdateChange = (index: number, field: keyof TaskUpdateInput, value: string) => {
    const newUpdates = [...taskUpdates]
    newUpdates[index] = { ...newUpdates[index], [field]: value } as TaskUpdateInput
    setTaskUpdates(newUpdates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm('Anda yakin ingin men-submit laporan ini? Setelah disubmit, laporan tidak dapat diubah lagi.')) {
      return
    }

    setLoading(true)
    const res = await submitDailyReport(report.id, taskUpdates)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Laporan harian berhasil dikirim!')
    }
  }

  const priorityColor = (p: string) => {
    if (p === 'tinggi') return 'text-rose-400 border-rose-400/20 bg-rose-400/10'
    if (p === 'sedang') return 'text-amber-400 border-amber-400/20 bg-amber-400/10'
    return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {updates.map((update, idx) => (
          <div key={update.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-6">
            
            {/* Info Tugas Asli */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priorityColor(update.plan_task.priority)}>
                  {update.plan_task.priority.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-500">Tugas {idx + 1}</span>
              </div>
              <h3 className="font-medium text-slate-200">{update.plan_task.title}</h3>
            </div>

            {/* Input Status & Catatan */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={taskUpdates[idx].completion_status} 
                  onValueChange={(val) => handleUpdateChange(idx, 'completion_status', val as any)}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="selesai">✅ Selesai</SelectItem>
                    <SelectItem value="dalam_proses">🔄 Dalam Proses</SelectItem>
                    <SelectItem value="tidak_selesai">❌ Tidak Selesai</SelectItem>
                    <SelectItem value="dibatalkan">🚫 Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea 
                  value={taskUpdates[idx].notes}
                  onChange={(e) => handleUpdateChange(idx, 'notes', e.target.value)}
                  placeholder="Tambahkan progress atau kendala..."
                  className="bg-slate-950 border-slate-700 resize-none h-20"
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg h-12 px-8">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {loading ? 'Menyimpan...' : 'Submit Laporan Final'}
        </Button>
      </div>
    </form>
  )
}

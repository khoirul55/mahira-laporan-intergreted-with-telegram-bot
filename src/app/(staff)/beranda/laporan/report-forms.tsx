'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import { createDailyPlan, submitDailyReport, PlanTaskInput, TaskUpdateInput, addAdhocTask } from '@/actions/report'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2, UploadCloud, X, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

export function CreatePlanForm() {
  const router = useRouter()
  const [tasks, setTasks] = useState<PlanTaskInput[]>([{ title: '', priority: 'sedang' }])
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (tasks.some(t => !t.title.trim())) {
      toast.error('Judul tugas tidak boleh kosong')
      return
    }

    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setLoading(true)
    const res = await createDailyPlan(tasks)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Rencana kerja berhasil disimpan')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Tugas {idx + 1}</Label>
                <Input 
                  value={task.title}
                  onChange={(e) => updateTask(idx, 'title', e.target.value)}
                  placeholder="Deskripsikan tugas..." 
                  className="bg-card border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select value={task.priority} onValueChange={(val) => updateTask(idx, 'priority', val as any)}>
                  <SelectTrigger className="bg-card border-border w-full sm:w-[200px]">
                    <SelectValue placeholder="Pilih prioritas">
                      {task.priority === 'tinggi' ? '🔴 Tinggi' : task.priority === 'sedang' ? '🟡 Sedang' : '🟢 Rendah'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="tinggi">🔴 Tinggi</SelectItem>
                    <SelectItem value="sedang">🟡 Sedang</SelectItem>
                    <SelectItem value="rendah">🟢 Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {tasks.length > 1 && (
              <Button type="button" onClick={() => removeTask(idx)} variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-400 mt-8">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="button" onClick={addTask} variant="outline" className="border-border text-emerald-400 hover:bg-muted">
          <Plus className="w-4 h-4 mr-2" /> Tambah Baris Tugas
        </Button>
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? 'Menyimpan...' : 'Simpan Rencana Kerja'}
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Konfirmasi Rencana Kerja"
        description="Apakah rencana kerja hari ini sudah lengkap? Anda tidak akan bisa mengubah atau menambah rencana kerja setelah disimpan."
        onConfirm={handleConfirmSubmit}
        variant="default"
        confirmText="Ya, Simpan"
      />
    </form>
  )
}

function AddAdhocTaskDialog({ reportId }: { reportId: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'tinggi'|'sedang'|'rendah'>('sedang')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Judul tugas tidak boleh kosong')
      return
    }
    setLoading(true)
    const res = await addAdhocTask(reportId, title, priority)
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Tugas tambahan berhasil ditambahkan!')
      setOpen(false)
      setTitle('')
      setPriority('sedang')
      router.refresh()
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        Tambah Tugas Susulan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tugas Susulan Baru</DialogTitle>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Tugas</Label>
            <Input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Deskripsi tugas tambahan..."
              className="bg-background border-border"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Prioritas</Label>
            <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tinggi">🔴 Tinggi</SelectItem>
                <SelectItem value="sedang">🟡 Sedang</SelectItem>
                <SelectItem value="rendah">🟢 Rendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Menyimpan...' : 'Simpan Tugas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}


export function UpdateReportForm({ report, updates }: { report: any, updates: any[] }) {
  const router = useRouter()
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdateInput[]>(
    updates.map(u => ({
      update_id: u.id,
      completion_status: u.completion_status,
      notes: u.notes || ''
    }))
  )

  useEffect(() => {
    if (updates.length !== taskUpdates.length) {
      setTaskUpdates(
        updates.map(u => {
          const existing = taskUpdates.find(tu => tu.update_id === u.id)
          if (existing) return existing
          return {
            update_id: u.id,
            completion_status: u.completion_status,
            notes: u.notes || ''
          }
        })
      )
    }
  }, [updates])
  const [loading, setLoading] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateChange = (index: number, field: keyof TaskUpdateInput, value: string) => {
    const newUpdates = [...taskUpdates]
    newUpdates[index] = { ...newUpdates[index], [field]: value } as TaskUpdateInput
    setTaskUpdates(newUpdates)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setLoading(true)

    let evidenceUrl = null
    if (evidenceFile) {
      const supabase = createClient()
      const fileExt = evidenceFile.name.split('.').pop()
      const fileName = `${report.id}_${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('report_evidences')
        .upload(fileName, evidenceFile)

      if (uploadError) {
        toast.error(`Gagal upload foto: ${uploadError.message}`)
        setLoading(false)
        return
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('report_evidences')
        .getPublicUrl(fileName)
        
      evidenceUrl = publicUrlData.publicUrl
    }

    const res = await submitDailyReport(report.id, taskUpdates, evidenceUrl)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Laporan harian berhasil dikirim!')
      router.refresh()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setEvidenceFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeFile = () => {
    setEvidenceFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const priorityLabel = (p: string) => {
    if (p === 'tinggi') return 'Tinggi'
    if (p === 'sedang') return 'Sedang'
    return 'Rendah'
  }

  const priorityColor = (p: string) => {
    if (p === 'tinggi') return 'text-rose-400 border-rose-400/20 bg-rose-400/10'
    if (p === 'sedang') return 'text-amber-400 border-amber-400/20 bg-amber-400/10'
    return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Daftar Tugas Hari Ini</h3>
      </div>
      <div className="space-y-4">
        {updates.map((update, idx) => (
          <div key={update.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row gap-6">
            
            {/* Info Tugas Asli */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={priorityColor(update.plan_task.priority)}>
                  {priorityLabel(update.plan_task.priority)}
                </Badge>
                {update.plan_task.is_adhoc && (
                  <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px]">
                    🆕 Tambahan
                  </Badge>
                )}
                {!update.plan_task.is_adhoc && (
                  <span className="text-xs text-muted-foreground">Tugas {idx + 1}</span>
                )}
              </div>
              <h3 className="font-medium text-foreground">{update.plan_task.title}</h3>
            </div>

            {/* Input Status & Catatan */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={taskUpdates[idx].completion_status} 
                  onValueChange={(val) => handleUpdateChange(idx, 'completion_status', val as any)}
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Pilih status">
                      {taskUpdates[idx].completion_status === 'selesai' ? '✅ Selesai' :
                       taskUpdates[idx].completion_status === 'dalam_proses' ? '🔄 Dalam Proses' :
                       taskUpdates[idx].completion_status === 'tidak_selesai' ? '❌ Tidak Selesai' :
                       taskUpdates[idx].completion_status === 'dibatalkan' ? '🚫 Dibatalkan' : 'Pilih status'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
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
                  className="bg-card border-border resize-none h-20"
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="flex justify-center sm:justify-end mt-2 mb-2">
        <AddAdhocTaskDialog reportId={report.id} />
      </div>

      <div className="p-6 rounded-xl border border-border bg-card mt-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          Upload Bukti Foto Laporan
        </h3>
        
        {previewUrl ? (
          <div className="relative inline-block border border-border rounded-lg overflow-hidden group">
            <img src={previewUrl} alt="Preview" className="w-full max-w-sm h-auto object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="destructive" size="sm" onClick={removeFile}>
                <Trash2 className="w-4 h-4 mr-2" /> Hapus Foto
              </Button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-emerald-500/50 bg-card hover:bg-emerald-500/5 transition-colors rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3"
          >
            <div className="p-3 bg-card rounded-full">
              <UploadCloud className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-secondary-foreground font-medium">Klik untuk upload atau drag & drop</p>
              <p className="text-muted-foreground text-sm mt-1">SVG, PNG, JPG atau GIF (Max. 5MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileSelect}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg h-12 px-8">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {loading ? 'Menyimpan...' : 'Submit Laporan Final'}
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Konfirmasi Submit Laporan"
        description="Anda yakin ingin men-submit laporan ini? Setelah disubmit, laporan tidak dapat diubah lagi dan akan diteruskan ke pimpinan."
        onConfirm={handleConfirmSubmit}
        variant="default"
        confirmText="Ya, Submit"
      />
    </form>
  )
}

import { Suspense } from 'react'
import { FileUpload } from '@/components/file-upload'
import { FileList } from '@/components/file-list'
import { getDivisionFiles } from '@/actions/archive'
import { createClient } from '@/lib/supabase/server'
import { FolderOpen, Upload, FileText } from 'lucide-react'

async function ArchiveContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's division
  const { data: userData } = await supabase
    .from('users')
    .select('division_id')
    .eq('id', user?.id)
    .single()

  const divisionId = userData?.division_id || 0
  
  const { data: files, error } = await getDivisionFiles()

  if (error) {
    return (
      <div className="surface p-6">
        <div className="text-center text-destructive">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-page-title">Error Memuat Data</h3>
          <p className="text-body mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-page-title text-lg">Arsip Dokumen Divisi</h1>
          <p className="text-body text-sm">Kelola dokumen dan file divisi Anda</p>
        </div>
        <FileUpload divisionId={divisionId} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Total File</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">{files?.length || 0}</div>
          <p className="text-meta mt-1">
            dokumen di arsip
          </p>
        </div>
        
        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Total Size</span>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {files ? 
              `${(files.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024).toFixed(1)} MB` 
              : '0 MB'
            }
          </div>
          <p className="text-meta mt-1">
            total ukuran file
          </p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Hari Ini</span>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {files ? 
              files.filter(file => 
                new Date(file.created_at).toDateString() === new Date().toDateString()
              ).length 
              : 0
            }
          </div>
          <p className="text-meta mt-1">
            file diupload hari ini
          </p>
        </div>
      </div>

      {/* File List */}
      <FileList 
        files={files || []}
        isDireksi={false}
      />
    </div>
  )
}

export default function ArsipPage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--muted)] rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-[var(--muted)] rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-[var(--muted)] rounded"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-[var(--muted)] rounded"></div>
          </div>
        </div>
      }>
        <ArchiveContent />
      </Suspense>
    </div>
  )
}

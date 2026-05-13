import { Suspense } from 'react'
import { FileList } from '@/components/file-list'
import { getAllFiles, getDivisions } from '@/actions/archive'
import { FolderOpen, Upload, FileText, Building2 } from 'lucide-react'
import ArchiveFilterClient from './filter-client'

async function ArchiveContent() {
  const { data: files, error } = await getAllFiles()
  const { data: divisions } = await getDivisions()

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

  // Calculate stats
  const totalFiles = files?.length || 0
  const totalSize = files?.reduce((acc, file) => acc + file.file_size, 0) || 0
  const todayFiles = files?.filter(file => 
    new Date(file.created_at).toDateString() === new Date().toDateString()
  ).length || 0

  // Group files by division
  const filesByDivision = files?.reduce((acc, file) => {
    const divisionName = file.divisions?.name || 'Unknown'
    if (!acc[divisionName]) {
      acc[divisionName] = []
    }
    acc[divisionName].push(file)
    return acc
  }, {} as Record<string, typeof files>) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-lg">Arsip Dokumen Semua Divisi</h1>
        <p className="text-body text-sm">Monitor dan kelola semua dokumen arsip per divisi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Total File</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">{totalFiles}</div>
          <p className="text-meta mt-1">
            dokumen di semua arsip
          </p>
        </div>
        
        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Total Size</span>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {(totalSize / 1024 / 1024).toFixed(1)} MB
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
          <div className="text-2xl font-semibold text-foreground">{todayFiles}</div>
          <p className="text-meta mt-1">
            file diupload hari ini
          </p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-section-label">Divisi Aktif</span>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">{Object.keys(filesByDivision).length}</div>
          <p className="text-meta mt-1">
            divisi memiliki arsip
          </p>
        </div>
      </div>

      {/* Division Summary */}
      <div className="surface p-4">
        <div className="mb-4">
          <h2 className="text-page-title flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Ringkasan per Divisi
          </h2>
          <p className="text-body text-sm mt-1">
            Overview jumlah file per divisi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(filesByDivision).map(([divisionName, divisionFiles]) => (
            <div key={divisionName} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="text-data">{divisionName}</div>
                <div className="text-body text-sm">
                  {divisionFiles.length} file • {(divisionFiles.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <span className="badge-neutral">
                {divisionFiles.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and File List */}
      <ArchiveFilterClient 
        initialFiles={files || []} 
        divisions={divisions || []}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-[var(--muted)] rounded"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-32 bg-[var(--muted)] rounded mb-4"></div>
            <div className="h-64 bg-[var(--muted)] rounded"></div>
          </div>
        </div>
      }>
        <ArchiveContent />
      </Suspense>
    </div>
  )
}

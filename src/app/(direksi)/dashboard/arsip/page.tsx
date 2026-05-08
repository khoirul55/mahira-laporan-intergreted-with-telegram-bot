import { Suspense } from 'react'
import { FileList } from '@/components/file-list'
import { getAllFiles, getDivisions } from '@/actions/archive'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderOpen, Upload, FileText, Building2 } from 'lucide-react'
import ArchiveFilterClient from './filter-client'

async function ArchiveContent() {
  const { data: files, error } = await getAllFiles()
  const { data: divisions } = await getDivisions()

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <h3 className="font-semibold">Error Memuat Data</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
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
        <h1 className="text-2xl font-bold">Arsip Dokumen Semua Divisi</h1>
        <p className="text-gray-600">Monitor dan kelola semua dokumen arsip per divisi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total File</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              dokumen di semua arsip
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalSize / 1024 / 1024).toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              total ukuran file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayFiles}</div>
            <p className="text-xs text-muted-foreground">
              file diupload hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisi Aktif</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(filesByDivision).length}</div>
            <p className="text-xs text-muted-foreground">
              divisi memiliki arsip
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Division Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Ringkasan per Divisi
          </CardTitle>
          <CardDescription>
            Overview jumlah file per divisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filesByDivision).map(([divisionName, divisionFiles]) => (
              <div key={divisionName} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{divisionName}</div>
                  <div className="text-sm text-gray-500">
                    {divisionFiles.length} file • {(divisionFiles.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <Badge variant="secondary">
                  {divisionFiles.length}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <ArchiveContent />
      </Suspense>
    </div>
  )
}

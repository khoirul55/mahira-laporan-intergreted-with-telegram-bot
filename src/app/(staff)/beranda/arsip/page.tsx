import { Suspense } from 'react'
import { FileUpload } from '@/components/file-upload'
import { FileList } from '@/components/file-list'
import { getDivisionFiles } from '@/actions/archive'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Arsip Dokumen Divisi</h1>
          <p className="text-gray-600">Kelola dokumen dan file divisi Anda</p>
        </div>
        <FileUpload divisionId={divisionId} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total File</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              dokumen di arsip
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
              {files ? 
                `${(files.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024).toFixed(1)} MB` 
                : '0 MB'
              }
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
            <div className="text-2xl font-bold">
              {files ? 
                files.filter(file => 
                  new Date(file.created_at).toDateString() === new Date().toDateString()
                ).length 
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              file diupload hari ini
            </p>
          </CardContent>
        </Card>
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
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <ArchiveContent />
      </Suspense>
    </div>
  )
}

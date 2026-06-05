'use client'

import { useState, useMemo } from 'react'
import { FileList } from '@/components/file-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'
import { ArchiveFile } from '@/actions/archive'

interface ArchiveFilterClientProps {
  initialFiles: ArchiveFile[]
  divisions: Array<{ id: number; name: string }>
}

export default function ArchiveFilterClient({ initialFiles, divisions }: ArchiveFilterClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDivision, setSelectedDivision] = useState<string | null>('all')
  const [selectedFileType, setSelectedFileType] = useState<string | null>('all')

  const filteredFiles = useMemo(() => {
    return initialFiles.filter(file => {
      // Search filter
      const matchesSearch = 
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.divisions?.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Division filter
      const matchesDivision = 
        selectedDivision === 'all' || 
        selectedDivision === null ||
        file.division_id.toString() === selectedDivision

      // File type filter
      const getFileType = (type: string) => {
        if (type.includes('pdf')) return 'pdf'
        if (type.includes('excel') || type.includes('spreadsheet')) return 'excel'
        if (type.includes('word') || type.includes('document')) return 'word'
        if (type.includes('image')) return 'image'
        return 'other'
      }

      const matchesFileType = 
        selectedFileType === 'all' || 
        selectedFileType === null ||
        getFileType(file.file_type) === selectedFileType

      return matchesSearch && matchesDivision && matchesFileType
    })
  }, [initialFiles, searchTerm, selectedDivision, selectedFileType])

  const stats = useMemo(() => {
    const totalSize = filteredFiles.reduce((acc, file) => acc + file.file_size, 0)
    const todayFiles = filteredFiles.filter(file => 
      new Date(file.created_at).toDateString() === new Date().toDateString()
    ).length

    return {
      totalFiles: filteredFiles.length,
      totalSize,
      todayFiles
    }
  }, [filteredFiles])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Division Filter */}
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id.toString()}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* File Type Filter */}
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="image">Gambar</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedDivision('all')
                setSelectedFileType('all')
              }}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Reset Filter
            </button>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedDivision !== 'all' && (
              <Badge variant="secondary">
                Divisi: {divisions.find(d => d.id.toString() === selectedDivision)?.name}
              </Badge>
            )}
            {selectedFileType !== 'all' && (
              <Badge variant="secondary">
                Tipe: {selectedFileType}
              </Badge>
            )}
            {filteredFiles.length !== initialFiles.length && (
              <Badge variant="outline">
                {filteredFiles.length} dari {initialFiles.length} file
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtered Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Tersaring</p>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">📄</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{(stats.totalSize / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-medium">💾</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
                <p className="text-2xl font-bold">{stats.todayFiles}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-medium">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      <FileList 
        files={filteredFiles}
        isDireksi={true}
        onFileDeleted={() => {
          // In a real app, you'd want to refresh the data
          window.location.reload()
        }}
        onFileUpdated={() => {
          // In a real app, you'd want to refresh the data
          window.location.reload()
        }}
      />
    </div>
  )
}

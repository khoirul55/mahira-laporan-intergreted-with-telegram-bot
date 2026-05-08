'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { downloadArchiveFile, deleteArchiveFile, updateFileDescription, ArchiveFile } from '@/actions/archive'
import { Download, Trash2, Edit2, File, Search, Loader2, Eye } from 'lucide-react'

interface FileListProps {
  files: ArchiveFile[]
  isDireksi?: boolean
  onFileDeleted?: () => void
  onFileUpdated?: () => void
}

export function FileList({ files, isDireksi = false, onFileDeleted, onFileUpdated }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDescription, setEditDescription] = useState('')

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = async (file: ArchiveFile) => {
    setDownloadingId(file.id)
    try {
      const result = await downloadArchiveFile(file.file_path, file.filename)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        // Create download link
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = file.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('File berhasil diunduh')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat download')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      return
    }

    setDeletingId(fileId)
    try {
      const result = await deleteArchiveFile(fileId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        onFileDeleted?.()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditDescription = async (fileId: number) => {
    try {
      const result = await updateFileDescription(fileId, editDescription)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        setEditingId(null)
        setEditDescription('')
        onFileUpdated?.()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui deskripsi')
    }
  }

  const startEdit = (file: ArchiveFile) => {
    setEditingId(file.id)
    setEditDescription(file.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDescription('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('image')) return '🖼️'
    if (type.includes('text')) return '📄'
    return '📎'
  }

  const getFileTypeColor = (type: string) => {
    if (type.includes('pdf')) return 'bg-red-100 text-red-800'
    if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-green-100 text-green-800'
    if (type.includes('word') || type.includes('document')) return 'bg-blue-100 text-blue-800'
    if (type.includes('image')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Arsip Dokumen</CardTitle>
            <CardDescription>
              {isDireksi ? 'Semua arsip dokumen divisi' : 'Arsip dokumen divisi Anda'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada file di arsip</p>
            <p className="text-sm">Upload file pertama untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredFiles.length} file</span>
              <span>•</span>
              <span>
                Total size: {filteredFiles.reduce((acc, file) => acc + file.file_size, 0).toLocaleString()} bytes
              </span>
            </div>

            {/* File Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Ukuran</TableHead>
                    <TableHead>Diupload oleh</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getFileIcon(file.file_type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{file.filename}</div>
                            {editingId === file.id ? (
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Tambah deskripsi..."
                                  className="h-8 text-xs"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleEditDescription(file.id)}
                                  className="h-8 px-2"
                                >
                                  Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                  className="h-8 px-2"
                                >
                                  Batal
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500 truncate">
                                  {file.description || 'Tidak ada deskripsi'}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEdit(file)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getFileTypeColor(file.file_type)}>
                          {formatFileSize(file.file_size)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{file.users?.full_name}</div>
                          {isDireksi && file.divisions && (
                            <div className="text-sm text-gray-500">{file.divisions.name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(file.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file)}
                            disabled={downloadingId === file.id}
                          >
                            {downloadingId === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file.id)}
                            disabled={deletingId === file.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deletingId === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

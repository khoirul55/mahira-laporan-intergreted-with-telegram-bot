'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { downloadArchiveFile, deleteArchiveFile, updateFileDescription, togglePinDocument, ArchiveFile } from '@/actions/archive'
import { Download, Trash2, Edit2, File, Search, Loader2, Eye, Pin } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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
  const [togglingPinId, setTogglingPinId] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  
  const router = useRouter()

  const handleTogglePin = async (fileId: number) => {
    setTogglingPinId(fileId)
    try {
      const result = await togglePinDocument(fileId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        onFileUpdated?.()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyematkan dokumen')
    } finally {
      setTogglingPinId(null)
    }
  }

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = async (file: ArchiveFile) => {
    setDownloadingId(file.id)
    try {
      const result = await downloadArchiveFile(file.file_path, file.title)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        // Create download link
        const link = document.createElement('a')
        link.href = result.downloadUrl as string
        link.download = file.title || 'download'
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

  const handleDelete = async () => {
    if (!deleteConfirmId) return

    setDeletingId(deleteConfirmId)
    const fileId = deleteConfirmId
    try {
      const result = await deleteArchiveFile(fileId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        onFileDeleted?.()
        router.refresh()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus')
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
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
    if (type.includes('pdf')) return 'text-red-400'
    if (type.includes('excel') || type.includes('spreadsheet')) return 'text-emerald-400'
    if (type.includes('word') || type.includes('document')) return 'text-blue-400'
    if (type.includes('image')) return 'text-purple-400'
    return 'text-muted-foreground'
  }

  return (
    <div className="surface">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-page-title mb-1">Arsip Dokumen</h2>
            <p className="text-body text-sm">
              {isDireksi ? 'Semua arsip dokumen divisi' : 'Arsip dokumen divisi Anda'}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Cari file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-clean pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-body">Belum ada file di arsip</p>
            <p className="text-meta mt-1">Upload file pertama untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="flex items-center gap-4 text-meta">
              <span>Total: {filteredFiles.length} file</span>
              <span className="text-muted-foreground">•</span>
              <span>
                Total size: {filteredFiles.reduce((acc, file) => acc + file.file_size, 0).toLocaleString()} bytes
              </span>
            </div>

            {/* File Table */}
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-[var(--card)]">
                    <th className="text-left px-4 py-3 text-section-label font-medium">File</th>
                    <th className="text-left px-4 py-3 text-section-label font-medium">Ukuran</th>
                    <th className="text-left px-4 py-3 text-section-label font-medium">Diupload oleh</th>
                    <th className="text-left px-4 py-3 text-section-label font-medium">Tanggal</th>
                    <th className="text-right px-4 py-3 text-section-label font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr 
                      key={file.id} 
                      className={`border-b border-border hover:bg-[var(--accent)] transition-all duration-200 ${
                        file.is_pinned ? 'bg-emerald-500/[0.02] border-l-2 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getFileIcon(file.file_type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-data truncate flex items-center gap-1.5">
                              {file.title}
                              {file.is_pinned && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                  📌 Pinned
                                </span>
                              )}
                            </div>
                            {editingId === file.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Tambah deskripsi..."
                                  className="input-clean h-8 text-xs"
                                />
                                <button
                                  onClick={() => handleEditDescription(file.id)}
                                  className="btn-primary h-8 px-3 text-xs"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="btn-ghost h-8 px-3 text-xs"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-body text-sm truncate">
                                  {file.description || 'Tidak ada deskripsi'}
                                </p>
                                <button
                                  onClick={() => startEdit(file)}
                                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-neutral">
                          {formatFileSize(file.file_size)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-data">{file.users?.full_name}</div>
                          {isDireksi && file.divisions && (
                            <div className="text-meta">{file.divisions.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-body text-sm">
                          {new Date(file.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isDireksi && (
                            <button
                              onClick={() => handleTogglePin(file.id)}
                              disabled={togglingPinId === file.id}
                              className={`btn-ghost h-8 px-2 transition-colors ${
                                file.is_pinned ? 'text-emerald-400 hover:text-emerald-500' : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={file.is_pinned ? 'Lepas Sematan' : 'Sematkan Dokumen'}
                            >
                              {togglingPinId === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Pin className={`w-4 h-4 ${file.is_pinned ? 'fill-current text-emerald-400' : ''}`} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={downloadingId === file.id}
                            className="btn-ghost h-8 px-2"
                          >
                            {downloadingId === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(file.id)}
                            disabled={deletingId === file.id}
                            className="btn-ghost h-8 px-2 text-destructive hover:text-destructive"
                          >
                            {deletingId === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <ConfirmDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Hapus File Arsip"
        description="Apakah Anda yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan dan file akan dihapus selamanya."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Ya, Hapus"
      />
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { uploadArchiveFile } from '@/actions/archive'
import { Upload, File, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  divisionId: number
  onUploadSuccess?: () => void
}

export function FileUpload({ divisionId, onUploadSuccess }: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File terlalu besar. Maksimal 10MB')
      return
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe file tidak didukung')
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadArchiveFile(divisionId, selectedFile, description)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        setSelectedFile(null)
        setDescription('')
        setIsOpen(false)
        onUploadSuccess?.()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setIsUploading(false)
    }
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
    return '📎'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        <Upload className="w-4 h-4" />
        <span>Upload File</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="surface relative z-10 w-full max-w-md p-6">
            <div className="mb-4">
              <h2 className="text-page-title mb-1">Upload File ke Arsip Divisi</h2>
              <p className="text-body text-sm">
                Upload dokumen untuk disimpan di arsip divisi Anda
              </p>
            </div>
            
            <div className="space-y-4">
              {/* File Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-[var(--accent)]'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="text-3xl">{getFileIcon(selectedFile.type)}</div>
                    <div className="text-data text-sm">{selectedFile.name}</div>
                    <div className="text-meta">{formatFileSize(selectedFile.size)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className="btn-ghost text-xs mt-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                    <div className="text-body text-sm">
                      Drag & drop file di sini atau klik untuk memilih
                    </div>
                    <div className="text-meta">
                      PDF, Word, Excel, TXT, JPG, PNG (Maks. 10MB)
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-section-label block">Deskripsi (opsional)</label>
                <textarea
                  placeholder="Tambahkan deskripsi file..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input-clean resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="btn-primary"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengupload...</span>
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

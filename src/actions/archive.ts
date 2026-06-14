'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ArchiveFile {
  id: number
  division_id: number
  uploaded_by: string
  title: string       // nama kolom di division_documents
  file_path: string
  file_size: number
  file_type: string
  description: string
  category: string
  is_pinned: boolean
  created_at: string
  divisions?: {
    name: string
  }
  users?: {
    full_name: string
  }
}

// Upload file ke arsip divisi
export async function uploadArchiveFile(
  divisionId: number,
  file: File,
  description?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: 'Tipe file tidak diizinkan. Hanya PDF, Word, Excel, JPG, dan PNG.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Ukuran file melebihi batas maksimal 5MB.' }
  }

  try {
    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = `${divisionId}/${user.id}_${timestamp}_${file.name}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('division-archives')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('division-archives')
      .getPublicUrl(filePath)

    // Save file metadata to database
    const { error: dbError } = await supabase
      .from('division_documents')
      .insert({
        division_id: divisionId,
        uploaded_by: user.id,
        title: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        description: description || null,
        category: 'lainnya'
      })

    if (dbError) {
      // Cleanup uploaded file if database insert fails
      await supabase.storage
        .from('division-archives')
        .remove([filePath])
      
      return { error: dbError.message }
    }

    revalidatePath('/beranda/arsip')
    revalidatePath('/dashboard/arsip')

    return { 
      success: true, 
      message: 'File berhasil diupload',
      data: {
        filename: file.name,
        size: file.size,
        url: publicUrl
      }
    }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat upload file' }
  }
}

// Get files untuk divisi user (staff)
export async function getDivisionFiles() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get user's division
    const { data: userData } = await supabase
      .from('users')
      .select('division_id')
      .eq('id', user.id)
      .single()

    if (!userData?.division_id) {
      return { error: 'User tidak memiliki divisi' }
    }

    // Get files for user's division
    const { data, error } = await supabase
      .from('division_documents')
      .select(`
        *,
        divisions(name),
        users!uploaded_by(full_name)
      `)
      .eq('division_id', userData.division_id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return { error: error.message }
    }

    return { data: data as ArchiveFile[] }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mengambil data' }
  }
}

// Get all files untuk direksi
export async function getAllFiles(divisionId?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    let query = supabase
      .from('division_documents')
      .select(`
        *,
        divisions(name),
        users!uploaded_by(full_name)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (divisionId) {
      query = query.eq('division_id', divisionId)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      return { error: error.message }
    }

    return { data: data as ArchiveFile[] }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mengambil data' }
  }
}

// Download file
export async function downloadArchiveFile(filePath: string, filename: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase.storage
      .from('division-archives')
      .createSignedUrl(filePath, 60) // 60 seconds expiry

    if (error) {
      return { error: error.message }
    }

    return { 
      success: true, 
      downloadUrl: data.signedUrl,
      filename 
    }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat menyiapkan download' }
  }
}

// Delete file
export async function deleteArchiveFile(fileId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from('division_documents')
      .select('file_path, uploaded_by')
      .eq('id', fileId)
      .single()

    if (fetchError) {
      return { error: fetchError.message }
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role !== 'direksi' && fileData.uploaded_by !== user.id) {
      return { error: 'Anda hanya bisa menghapus file yang Anda unggah' }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('division-archives')
      .remove([fileData.file_path])

    if (storageError) {
      return { error: storageError.message }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('division_documents')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      return { error: dbError.message }
    }

    revalidatePath('/beranda/arsip')
    revalidatePath('/dashboard/arsip')

    return { success: true, message: 'File berhasil dihapus' }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat menghapus file' }
  }
}

// Update file description
export async function updateFileDescription(fileId: number, description: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('division_documents')
      .update({ description })
      .eq('id', fileId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/beranda/arsip')
    revalidatePath('/dashboard/arsip')

    return { success: true, message: 'Deskripsi berhasil diperbarui' }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat memperbarui deskripsi' }
  }
}


// Toggle pin document (hanya untuk direksi)
export async function togglePinDocument(fileId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if user is direksi
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'direksi') {
      return { error: 'Hanya pimpinan yang dapat menyematkan dokumen' }
    }

    // Get current status
    const { data: fileData, error: fetchError } = await supabase
      .from('division_documents')
      .select('is_pinned')
      .eq('id', fileId)
      .single()

    if (fetchError) {
      return { error: fetchError.message }
    }

    const { error } = await supabase
      .from('division_documents')
      .update({ is_pinned: !fileData.is_pinned })
      .eq('id', fileId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/beranda/arsip')
    revalidatePath('/dashboard/arsip')

    return { 
      success: true, 
      message: fileData.is_pinned ? 'Dokumen dilepas dari sematan' : 'Dokumen berhasil disematkan' 
    }
  } catch (error) {
    return { error: 'Terjadi kesalahan saat mengubah status sematan' }
  }
}

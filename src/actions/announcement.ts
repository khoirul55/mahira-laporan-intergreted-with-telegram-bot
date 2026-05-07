'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!title || !content) {
    return { error: 'Judul dan konten harus diisi' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if direksi
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'direksi') {
    return { error: 'Hanya direksi yang bisa membuat pengumuman' }
  }

  const { error } = await supabase
    .from('announcements')
    .insert([{
      title,
      content,
      created_by: user.id
    }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/pengumuman')
  revalidatePath('/beranda')
  return { success: true }
}

export async function deleteAnnouncement(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if direksi
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'direksi') {
    return { error: 'Hanya direksi yang bisa menghapus pengumuman' }
  }

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/pengumuman')
  revalidatePath('/beranda')
  return { success: true }
}

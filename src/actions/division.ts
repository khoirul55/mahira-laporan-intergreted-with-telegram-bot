'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDivision(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'Nama divisi wajib diisi' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('divisions')
    .insert([{ name, description }])

  if (error) {
    if (error.code === '23505') return { error: 'Nama divisi sudah digunakan' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/divisions')
  return { success: true }
}

export async function updateDivision(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!id || !name) return { error: 'Data tidak lengkap' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('divisions')
    .update({ name, description })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Nama divisi sudah digunakan' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/divisions')
  return { success: true }
}

export async function deleteDivision(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return { error: 'ID tidak ditemukan' }

  const supabase = await createClient()

  // Cek apakah ada user di divisi ini
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('division_id', id)

  if (count && count > 0) {
    return { error: `Tidak bisa menghapus divisi karena masih ada ${count} user di dalamnya.` }
  }

  const { error } = await supabase
    .from('divisions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/divisions')
  return { success: true }
}

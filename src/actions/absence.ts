'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAbsence(formData: FormData) {
  const absence_date = formData.get('absence_date') as string
  const type = formData.get('type') as string
  const reason = formData.get('reason') as string

  if (!absence_date || !type) return { error: 'Tanggal dan tipe izin wajib diisi' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('absences')
    .insert([{ 
      user_id: user.id,
      absence_date, 
      type, 
      reason 
    }])

  if (error) {
    if (error.code === '23505') return { error: 'Anda sudah mengajukan izin/kehadiran untuk tanggal ini' }
    return { error: error.message }
  }

  revalidatePath('/beranda/izin')
  return { success: true }
}

export async function deleteAbsence(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('absences')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // pastikan hanya bisa hapus miliknya sendiri

  if (error) return { error: error.message }

  revalidatePath('/beranda/izin')
  return { success: true }
}

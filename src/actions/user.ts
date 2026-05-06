'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string
  const division_id = formData.get('division_id') as string

  if (!email || !password || !full_name) {
    return { error: 'Semua kolom wajib diisi' }
  }

  const adminAuth = createAdminClient().auth

  // 1. Create user in Supabase Auth (this triggers the database function to create public.users row)
  const { data: authData, error: authError } = await adminAuth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto confirm so they can login immediately
    user_metadata: {
      full_name,
      role,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Update division_id in public.users if provided
  if (division_id && division_id !== 'none' && authData.user) {
    const supabase = await createClient()
    await supabase
      .from('users')
      .update({ division_id: parseInt(division_id) })
      .eq('id', authData.user.id)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function updateUser(formData: FormData) {
  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string
  const division_id = formData.get('division_id') as string
  const is_active = formData.get('is_active') === 'true'

  if (!id || !full_name) return { error: 'Data tidak lengkap' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ 
      full_name, 
      role, 
      division_id: division_id && division_id !== 'none' ? parseInt(division_id) : null,
      is_active
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return { error: 'ID tidak ditemukan' }

  const adminAuth = createAdminClient().auth

  // Delete from auth.users (will CASCADE to public.users and others)
  const { error } = await adminAuth.admin.deleteUser(id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/users')
  return { success: true }
}

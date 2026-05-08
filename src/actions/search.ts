'use server'

import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  search?: string
  dateRange?: string
  date_from?: string
  date_to?: string
  division_id?: string
  status?: string
  file_type?: string
}

// Search daily reports untuk staff
export async function searchReports(filters: SearchFilters, userId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        users(full_name, divisions(name))
      `)
      .order('report_date', { ascending: false })

    // Filter untuk staff (hanya laporan sendiri)
    if (!userId || userId === user.id) {
      query = query.eq('user_id', user.id)
    } else if (userId) {
      // Untuk direksi yang melihat laporan staff tertentu
      query = query.eq('user_id', userId)
    }

    // Apply search filter
    if (filters.search) {
      query = query.or(`
        plan_notes.ilike.%${filters.search}%,
        notes.ilike.%${filters.search}%
      `)
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'custom') {
      const today = new Date()
      let startDate: Date | undefined
      let endDate: Date | undefined = new Date(today)

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today.setHours(0, 0, 0, 0))
          break
        case 'yesterday':
          startDate = new Date(today.setDate(today.getDate() - 1))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(today)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'this_week':
          startDate = new Date(today.setDate(today.getDate() - today.getDay()))
          startDate.setHours(0, 0, 0, 0)
          break
        case 'last_week':
          startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(today.setDate(today.getDate() - today.getDay()))
          endDate.setHours(23, 59, 59, 999)
          break
        case 'this_month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          break
        case 'last_month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          endDate = new Date(today.getFullYear(), today.getMonth(), 0)
          break
        default:
          break
      }

      if (startDate) {
        query = query.gte('report_date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        query = query.lte('report_date', endDate.toISOString().split('T')[0])
      }
    }

    // Custom date range
    if (filters.date_from) {
      query = query.gte('report_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('report_date', filters.date_to)
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mencari laporan' }
  }
}

// Search all reports untuk direksi
export async function searchAllReports(filters: SearchFilters) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        users(full_name, divisions(name))
      `)
      .order('report_date', { ascending: false })

    // Apply search filter
    if (filters.search) {
      query = query.or(`
        plan_notes.ilike.%${filters.search}%,
        notes.ilike.%${filters.search}%,
        users.full_name.ilike.%${filters.search}%,
        users.divisions.name.ilike.%${filters.search}%
      `)
    }

    // Apply date range filter (sama seperti di atas)
    if (filters.dateRange && filters.dateRange !== 'custom') {
      const today = new Date()
      let startDate: Date | undefined
      let endDate: Date | undefined = new Date(today)

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today.setHours(0, 0, 0, 0))
          break
        case 'yesterday':
          startDate = new Date(today.setDate(today.getDate() - 1))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(today)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'this_week':
          startDate = new Date(today.setDate(today.getDate() - today.getDay()))
          startDate.setHours(0, 0, 0, 0)
          break
        case 'last_week':
          startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7))
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(today.setDate(today.getDate() - today.getDay()))
          endDate.setHours(23, 59, 59, 999)
          break
        case 'this_month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          break
        case 'last_month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          endDate = new Date(today.getFullYear(), today.getMonth(), 0)
          break
        default:
          break
      }

      if (startDate) {
        query = query.gte('report_date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        query = query.lte('report_date', endDate.toISOString().split('T')[0])
      }
    }

    // Custom date range
    if (filters.date_from) {
      query = query.gte('report_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('report_date', filters.date_to)
    }

    // Division filter
    if (filters.division_id && filters.division_id !== 'all') {
      query = query.eq('users.division_id', parseInt(filters.division_id))
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mencari laporan' }
  }
}

// Export to CSV functionality
export async function exportReportsToCSV(filters: SearchFilters, isDireksi = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get data based on role
    const result = isDireksi 
      ? await searchAllReports(filters)
      : await searchReports(filters)

    if (result.error || !result.data) {
      return { error: result.error || 'Tidak ada data' }
    }

    const reports = result.data

    // Create CSV content
    const headers = [
      'Tanggal',
      'Nama Staff',
      'Divisi',
      'Status',
      'Rencana Kerja',
      'Catatan Sore',
      'Feedback Direksi',
      'Dibuat Pada'
    ]

    const csvContent = [
      headers.join(','),
      ...reports.map((report: any) => [
        report.report_date,
        `"${report.users?.full_name || ''}"`,
        `"${report.users?.divisions?.name || ''}"`,
        report.status,
        `"${(report.plan_notes || '').replace(/"/g, '""')}"`,
        `"${(report.notes || '').replace(/"/g, '""')}"`,
        `"${(report.direksi_notes || '').replace(/"/g, '""')}"`,
        report.created_at
      ].join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'CSV berhasil diunduh' }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat export CSV' }
  }
}

// Get divisions for filter
export async function getDivisions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('id, name')
      .order('name')

    if (error) {
      return { error: error.message }
    }

    return { data }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mengambil data divisi' }
  }
}

// Get search statistics
export async function getSearchStats(filters: SearchFilters, isDireksi = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    let query = supabase
      .from('daily_reports')
      .select('status', { count: 'exact' })

    // Apply same filters as search
    if (!isDireksi) {
      query = query.eq('user_id', user.id)
    }

    if (filters.search) {
      query = query.or(`
        plan_notes.ilike.%${filters.search}%,
        notes.ilike.%${filters.search}%
      `)
    }

    // Apply date filters (simplified for stats)
    if (filters.date_from) {
      query = query.gte('report_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('report_date', filters.date_to)
    }

    if (filters.division_id && filters.division_id !== 'all' && isDireksi) {
      query = query.eq('users.division_id', parseInt(filters.division_id))
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error, count } = await query

    if (error) {
      return { error: error.message }
    }

    // Calculate stats
    const stats = {
      total: count || 0,
      submitted: data?.filter(r => r.status === 'submitted').length || 0,
      draft: data?.filter(r => r.status === 'draft').length || 0,
      plan_only: data?.filter(r => r.status === 'plan_only').length || 0
    }

    return { data: stats }

  } catch (error) {
    return { error: 'Terjadi kesalahan saat mengambil statistik' }
  }
}

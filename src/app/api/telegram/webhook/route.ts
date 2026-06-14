import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage, verifyWebhookSecret } from '@/lib/telegram'
import { getTodayWIB } from '@/lib/utils'

// Handle Telegram webhook updates
export async function POST(request: NextRequest) {
  // Verify secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const update = await request.json()
    const text = update.message?.text || ''

    if (text.startsWith('/start')) {
      await handleStartCommand(update.message)
    } else if (text.startsWith('/status')) {
      await handleStatusCommand(update.message)
    } else if (text.startsWith('/help')) {
      await handleHelpCommand(update.message)
    } else if (text.startsWith('/izin')) {
      await handleIzinCommand(update.message)
    } else if (text.startsWith('/unlink')) {
      await handleUnlinkCommand(update.message)
    } else if (text.startsWith('/rekap')) {
      await handleRekapCommand(update.message)
    } else if (text.startsWith('/pantau')) {
      await handlePantauCommand(update.message)
    } else if (text.startsWith('/pengumuman')) {
      await handlePengumumanCommand(update.message)
    } else if (text.startsWith('/kemarin')) {
      await handleKemarinCommand(update.message)
    } else {
      await sendTelegramMessage(update.message.chat.id.toString(), '❓ Command tidak dikenali. Ketik /help untuk melihat daftar command yang tersedia.')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}

async function handleStartCommand(message: { chat: { id: number }; text: string; from: { id: number } }) {
  const chatId = message.chat.id.toString()
  const args = message.text.split(' ')

  // /start <link_token> — link account
  if (args.length > 1) {
    const linkToken = args[1]
    const supabase = createAdminClient()

    // Token format: user_<user_id>
    if (linkToken.startsWith('user_')) {
      const userId = linkToken.replace('user_', '')

      const { error } = await supabase
        .from('users')
        .update({ telegram_id: chatId })
        .eq('id', userId)

      if (error) {
        await sendTelegramMessage(chatId, '❌ Gagal menghubungkan akun. Coba lagi.')
      } else {
        await sendTelegramMessage(chatId, '✅ <b>Akun berhasil terhubung!</b>\n\nAnda akan menerima reminder laporan harian jam 16:00 WIB.\n\nKetik /status untuk cek status laporan hari ini.')
      }
      return
    }
  }

  await sendTelegramMessage(chatId, `👋 <b>Selamat datang di Mahira Tour Bot!</b>\n\nUntuk menghubungkan akun Anda, silakan klik tombol "Hubungkan Telegram" di halaman Profil website.\n\n<b>Commands:</b>\n/status - Cek status laporan hari ini`)
}

async function handleStatusCommand(message: { chat: { id: number }; from: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  // Find user by telegram_id
  const { data: user } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('telegram_id', chatId)
    .single()

  if (!user) {
    await sendTelegramMessage(chatId, '❌ Akun belum terhubung. Hubungkan dulu di halaman Profil website.')
    return
  }

  const today = getTodayWIB()

  // Check absence
  const { data: absence } = await supabase
    .from('absences')
    .select('type')
    .eq('user_id', user.id)
    .eq('absence_date', today)
    .single()

  if (absence) {
    await sendTelegramMessage(chatId, `📅 Halo <b>${user.full_name}</b>,\nHari ini Anda tercatat <b>${absence.type}</b>. Tidak perlu submit laporan.`)
    return
  }

  // Check report status
  const { data: plan } = await supabase
    .from('daily_work_plans')
    .select('id, daily_reports(status, submitted_at), plan_tasks(title, is_adhoc)')
    .eq('user_id', user.id)
    .eq('plan_date', today)
    .single()

  if (!plan) {
    await sendTelegramMessage(chatId, `⚠️ Halo <b>${user.full_name}</b>,\nAnda belum membuat rencana kerja hari ini.\n\n📝 <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/laporan">Buat Rencana</a>`)
    return
  }

  const report = (plan as Record<string, unknown>).daily_reports as { status: string; submitted_at: string } | null
  const tasks = (plan as Record<string, unknown>).plan_tasks as { title: string; is_adhoc: boolean }[] | null
  
  let tasksText = ''
  if (tasks && tasks.length > 0) {
    tasksText = '\n\n<b>📋 Daftar Tugas Hari Ini:</b>\n' + tasks.map((t, i) => `${i + 1}. ${t.title} ${t.is_adhoc ? '<i>(Susulan)</i>' : ''}`).join('\n')
  }

  if (!report || report.status === 'draft') {
    await sendTelegramMessage(chatId, `📝 Halo <b>${user.full_name}</b>,\nRencana kerja sudah dibuat, tapi laporan <b>belum disubmit</b>.${tasksText}\n\n📤 <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/laporan">Submit Laporan</a>`)
  } else {
    await sendTelegramMessage(chatId, `✅ Halo <b>${user.full_name}</b>,\nLaporan hari ini sudah <b>disubmit</b>. Terima kasih! 🎉${tasksText}`)
  }
}

async function handleHelpCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  // Find user by telegram_id
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('telegram_id', chatId)
    .single()

  let helpText = `📖 <b>Daftar Command Staff</b>

/start — Hubungkan akun Telegram
/status — Cek status laporan hari ini
/kemarin — Cek laporan kerja kemarin
/izin — Lihat rekap izin bulan ini
/pengumuman — Lihat pengumuman terbaru
/unlink — Lepaskan (unbind) akun Telegram
/help — Tampilkan bantuan ini`

  if (user?.role === 'direksi') {
    helpText += `\n\n👑 <b>Command Direksi</b>\n\n/rekap — Ringkasan status lapor semua staff hari ini\n/pantau — Lihat detail tugas harian semua staff`
  }

  if (!user) {
    helpText += `\n\n💡 Hubungkan akun dulu di halaman Profil website agar bisa gunakan semua fitur.`
  }

  await sendTelegramMessage(chatId, helpText)
}

async function handleIzinCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('telegram_id', chatId)
    .single()

  if (!user) {
    await sendTelegramMessage(chatId, '❌ Akun belum terhubung. Hubungkan dulu di halaman Profil website.')
    return
  }

  // Get current month absences
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: absences } = await supabase
    .from('absences')
    .select('type, absence_date')
    .eq('user_id', user.id)
    .gte('absence_date', startOfMonth)
    .lte('absence_date', endOfMonth)

  if (!absences || absences.length === 0) {
    await sendTelegramMessage(chatId, `📅 Halo <b>${user.full_name}</b>,\nAnda belum ada izin bulan ini.\n\n➕ <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/izin">Ajukan Izin</a>`)
    return
  }

  const breakdown: Record<string, number> = {}
  absences.forEach(a => { breakdown[a.type] = (breakdown[a.type] || 0) + 1 })

  const lines = Object.entries(breakdown).map(([type, count]) => {
    const label = type === 'sakit' ? '🤒 Sakit' : type === 'cuti' ? '🏖️ Cuti' : type === 'dinas_luar' ? '🚗 Dinas Luar' : '📋 Lainnya'
    return `${label}: ${count} hari`
  })

  await sendTelegramMessage(chatId, `📅 <b>Rekap Izin Bulan Ini</b>\n\nHalo <b>${user.full_name}</b>,\n\nTotal: <b>${absences.length} hari</b>\n${lines.join('\n')}\n\n➕ <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/izin">Ajukan Izin Baru</a>`)
}

async function handleUnlinkCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  // Find users with this telegram_id
  const { data: users } = await supabase.from('users').select('id').eq('telegram_id', chatId)

  if (users && users.length > 0) {
    // Nullify telegram_id for all accounts linked to this chat
    await supabase.from('users').update({ telegram_id: null }).eq('telegram_id', chatId)
    await sendTelegramMessage(chatId, '✅ <b>Akun Telegram berhasil dilepaskan (unbind).</b>\n\nTelegram ini tidak lagi terhubung ke akun Mahira manapun. Anda bisa menghubungkannya kembali dengan akun yang benar melalui menu Profil di website.')
  } else {
    await sendTelegramMessage(chatId, 'ℹ️ Akun Telegram ini belum terhubung ke user manapun.')
  }
}

async function handlePengumumanCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  const { data: user } = await supabase.from('users').select('id, full_name, division_id').eq('telegram_id', chatId).single()
  if (!user) {
    await sendTelegramMessage(chatId, '❌ Akun belum terhubung. Hubungkan dulu di halaman Profil website.')
    return
  }

  // Fetch the latest announcement (either global or targeting their division)
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .or(`target_division_id.is.null,target_division_id.eq.${user.division_id}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!announcements || announcements.length === 0) {
    await sendTelegramMessage(chatId, '📭 Belum ada pengumuman terbaru.')
    return
  }

  const ann = announcements[0]
  const dateStr = new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  
  await sendTelegramMessage(chatId, `📢 <b>PENGUMUMAN TERBARU</b>\n📅 ${dateStr}\n\n<b>${ann.title}</b>\n\n${ann.content}`)
}

async function handleKemarinCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  const { data: user } = await supabase.from('users').select('id, full_name').eq('telegram_id', chatId).single()
  if (!user) {
    await sendTelegramMessage(chatId, '❌ Akun belum terhubung. Hubungkan dulu di halaman Profil website.')
    return
  }

  const today = getTodayWIB()

  // Find the most recent plan before today
  const { data: plans } = await supabase
    .from('daily_work_plans')
    .select('id, plan_date, daily_reports(id, status)')
    .eq('user_id', user.id)
    .lt('plan_date', today)
    .order('plan_date', { ascending: false })
    .limit(1)

  if (!plans || plans.length === 0) {
    await sendTelegramMessage(chatId, '📝 Belum ada rekam jejak laporan di hari sebelumnya.')
    return
  }

  const lastPlan = plans[0]
  const report = Array.isArray(lastPlan.daily_reports) ? lastPlan.daily_reports[0] : lastPlan.daily_reports
  
  const { data: taskUpdates } = await supabase
    .from('task_updates')
    .select('completion_status, plan_tasks(title)')
    .eq('report_id', report?.id)

  let text = `📅 <b>Laporan Terakhir (${lastPlan.plan_date})</b>\n\n`
  
  if (!taskUpdates || taskUpdates.length === 0) {
    text += 'Tidak ada tugas yang dicatat.'
  } else {
    taskUpdates.forEach((t: any, i: number) => {
      const statusIcon = t.completion_status === 'selesai' ? '✅' :
                         t.completion_status === 'dalam_proses' ? '🔄' :
                         t.completion_status === 'tidak_selesai' ? '❌' : '🚫'
      text += `${i + 1}. ${statusIcon} ${t.plan_tasks.title}\n`
    })
  }

  await sendTelegramMessage(chatId, text)
}

async function handleRekapCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  const { data: admin } = await supabase.from('users').select('role').eq('telegram_id', chatId).single()
  if (admin?.role !== 'direksi') {
    await sendTelegramMessage(chatId, '⛔ Akses ditolak. Command ini hanya untuk Direksi.')
    return
  }

  const today = getTodayWIB()

  // 1. Get all staff users
  const { data: users } = await supabase.from('users').select('id, full_name').eq('role', 'staff')
  if (!users) return

  // 2. Get today's absences
  const { data: absences } = await supabase.from('absences').select('user_id, type').eq('absence_date', today)
  const absentUserIds = new Set(absences?.map(a => a.user_id) || [])

  // 3. Get today's plans & reports
  const { data: plans } = await supabase.from('daily_work_plans').select('user_id, daily_reports(status)').eq('plan_date', today)
  
  let countSubmitted = 0
  let countDraft = 0
  let countNoPlan = 0
  let countAbsent = absentUserIds.size

  const activeUsers = users.filter(u => !absentUserIds.has(u.id))

  activeUsers.forEach(user => {
    const userPlan = plans?.find(p => p.user_id === user.id)
    if (!userPlan) {
      countNoPlan++
    } else {
      const reportStatus = Array.isArray(userPlan.daily_reports) 
        ? userPlan.daily_reports[0]?.status 
        : (userPlan.daily_reports as any)?.status

      if (reportStatus === 'submitted') countSubmitted++
      else countDraft++
    }
  })

  const text = `📊 <b>Rekap Status Hari Ini (${today})</b>\n\n` +
               `✅ ${countSubmitted} Sudah Submit Laporan\n` +
               `🔄 ${countDraft} Sedang Bekerja (Draft)\n` +
               `⚠️ ${countNoPlan} Belum Buat Rencana\n` +
               `🏖️ ${countAbsent} Izin/Cuti\n\n` +
               `Total Staff: ${users.length}`

  await sendTelegramMessage(chatId, text)
}

async function handlePantauCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  const supabase = createAdminClient()

  const { data: admin } = await supabase.from('users').select('role').eq('telegram_id', chatId).single()
  if (admin?.role !== 'direksi') {
    await sendTelegramMessage(chatId, '⛔ Akses ditolak. Command ini hanya untuk Direksi.')
    return
  }

  const today = getTodayWIB()

  // 1. Get all staff
  const { data: users } = await supabase.from('users').select('id, full_name, division:divisions(name)').eq('role', 'staff')
  if (!users || users.length === 0) return

  // 2. Get today's plans with tasks
  const { data: plans } = await supabase
    .from('daily_work_plans')
    .select('user_id, plan_tasks(title, is_adhoc), daily_reports(status)')
    .eq('plan_date', today)

  let textBlocks: string[] = []
  
  users.forEach(user => {
    const userPlan = plans?.find(p => p.user_id === user.id)
    const divName = (user as any).division?.name || '-'
    
    let block = `👤 <b>${user.full_name}</b> (${divName})\n`
    
    if (!userPlan) {
      block += `<i>Belum membuat rencana kerja</i>\n\n`
    } else {
      const reportStatus = Array.isArray(userPlan.daily_reports) 
        ? userPlan.daily_reports[0]?.status 
        : (userPlan.daily_reports as any)?.status
      
      const statusIcon = reportStatus === 'submitted' ? '✅' : '🔄'
      block += `Status: ${statusIcon} ${reportStatus === 'submitted' ? 'Sudah Submit' : 'Draft'}\n`
      
      const tasks = (userPlan as any).plan_tasks || []
      if (tasks.length === 0) {
        block += `Tugas: <i>Kosong</i>\n\n`
      } else {
        tasks.forEach((t: any, i: number) => {
          block += `${i + 1}. ${t.title} ${t.is_adhoc ? '<i>(Susulan)</i>' : ''}\n`
        })
        block += '\n'
      }
    }
    textBlocks.push(block)
  })

  // Group into chunks of ~3500 chars to respect Telegram's 4096 limit
  let currentChunk = `👀 <b>Pantauan Kerja (${today})</b>\n\n`
  const chunks: string[] = []

  for (const block of textBlocks) {
    if (currentChunk.length + block.length > 3500) {
      chunks.push(currentChunk)
      currentChunk = block
    } else {
      currentChunk += block
    }
  }
  if (currentChunk.trim() !== '') {
    chunks.push(currentChunk)
  }

  for (let i = 0; i < chunks.length; i++) {
    const prefix = chunks.length > 1 ? `[Part ${i + 1}/${chunks.length}]\n` : ''
    await sendTelegramMessage(chatId, prefix + chunks[i])
  }
}

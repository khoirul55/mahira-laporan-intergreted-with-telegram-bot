import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage, verifyWebhookSecret } from '@/lib/telegram'

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

  const today = new Date().toISOString().split('T')[0]

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
    .select('id, daily_reports(status, submitted_at)')
    .eq('user_id', user.id)
    .eq('plan_date', today)
    .single()

  if (!plan) {
    await sendTelegramMessage(chatId, `⚠️ Halo <b>${user.full_name}</b>,\nAnda belum membuat rencana kerja hari ini.\n\n📝 <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/laporan">Buat Rencana</a>`)
    return
  }

  const report = (plan as Record<string, unknown>).daily_reports as { status: string; submitted_at: string } | null
  if (!report || report.status === 'draft') {
    await sendTelegramMessage(chatId, `📝 Halo <b>${user.full_name}</b>,\nRencana kerja sudah dibuat, tapi laporan <b>belum disubmit</b>.\n\n📤 <a href="${process.env.NEXT_PUBLIC_APP_URL}/beranda/laporan">Submit Laporan</a>`)
  } else {
    await sendTelegramMessage(chatId, `✅ Halo <b>${user.full_name}</b>,\nLaporan hari ini sudah <b>disubmit</b>. Terima kasih! 🎉`)
  }
}

async function handleHelpCommand(message: { chat: { id: number } }) {
  const chatId = message.chat.id.toString()
  await sendTelegramMessage(chatId, `📖 <b>Daftar Command</b>

/start — Hubungkan akun Telegram
/status — Cek status laporan hari ini
/izin — Lihat rekap izin bulan ini
/help — Tampilkan bantuan ini

💡 Hubungkan akun dulu di halaman Profil website agar bisa gunakan semua fitur.`)
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
  const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`

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


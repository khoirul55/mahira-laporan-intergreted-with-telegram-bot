const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendTelegramMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  })
  return res.json()
}

export async function setWebhook(url: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || ''
  const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      secret_token: secret,
    }),
  })
  return res.json()
}

export async function deleteWebhook() {
  const res = await fetch(`${TELEGRAM_API}/deleteWebhook`, { method: 'POST' })
  return res.json()
}

export function verifyWebhookSecret(request: Request): boolean {
  const secret = request.headers.get('x-telegram-bot-api-secret-token')
  return secret === process.env.TELEGRAM_WEBHOOK_SECRET
}

// Format pesan reminder
export function formatReminderMessage(fullName: string, appUrl: string): string {
  return `🔔 <b>Reminder Laporan Harian</b>

Halo <b>${fullName}</b>,
Laporan harian Anda hari ini belum disubmit. Segera lengkapi sebelum pulang ya!

📝 <a href="${appUrl}/beranda/laporan">Buka Laporan</a>`
}

// Format weekly digest
export function formatWeeklyDigest(data: {
  period: string
  totalStaff: number
  submitted: number
  pending: number
  onLeave: number
  completionRate: number
}): string {
  return `📊 <b>Weekly Digest - ${data.period}</b>

👥 Total Staff: ${data.totalStaff}
✅ Submit tepat waktu: ${data.submitted}
⚠️ Belum/terlambat: ${data.pending}
📅 Izin: ${data.onLeave}

📈 Completion Rate: <b>${data.completionRate}%</b>`
}

// Format notifikasi submit laporan ke pimpinan
export function formatSubmitNotification(data: {
  staffName: string
  divisionName: string
  date: string
  completedTasks: number
  totalTasks: number
}): string {
  return `📤 <b>Laporan Baru Masuk</b>

👤 ${data.staffName} — ${data.divisionName}
📅 ${data.date}
✅ ${data.completedTasks}/${data.totalTasks} tugas selesai

📋 <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/laporan">Lihat Detail</a>`
}

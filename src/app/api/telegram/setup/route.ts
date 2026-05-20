import { NextRequest, NextResponse } from 'next/server'
import { setWebhook, deleteWebhook } from '@/lib/telegram'

// Setup/delete webhook - run once manually
// GET /api/telegram/setup?action=set&secret=YOUR_SECRET
// GET /api/telegram/setup?action=delete&secret=YOUR_SECRET
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = request.nextUrl.searchParams.get('action') || 'set'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://laporan.mahiratour.id'

  if (action === 'delete') {
    const result = await deleteWebhook()
    return NextResponse.json({ action: 'delete', result })
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`
  const result = await setWebhook(webhookUrl)
  return NextResponse.json({ action: 'set', webhookUrl, result })
}

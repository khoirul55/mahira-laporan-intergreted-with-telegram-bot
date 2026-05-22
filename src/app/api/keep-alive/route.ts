import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    // Simple ping query to keep Supabase active
    const { data, error } = await supabase
      .from('divisions')
      .select('id')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase connection successfully kept alive',
      ping: 'success'
    })
  } catch (error: any) {
    console.error('Keep-alive failed:', error)
    return NextResponse.json({
      ok: false,
      timestamp: new Date().toISOString(),
      error: error.message || 'Database connection error'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('leads')
      .select('audit_data, total_monthly_savings, created_at, share_token')
      .eq('share_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Result API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
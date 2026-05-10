import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, companyName, role, teamSize, auditData, totalMonthlySavings } = await req.json()

    // Basic honeypot check
    if (auditData?.honeypot) {
      return NextResponse.json({ success: true })
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        email,
        company_name: companyName,
        role,
        team_size: teamSize,
        audit_data: auditData,
        total_monthly_savings: totalMonthlySavings,
      })
      .select('share_token')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'TokenTab <onboarding@resend.dev>',
        to: email,
        subject: 'Your AI Spend Audit Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your AI Spend Audit is Ready</h2>
            <p>Hi there,</p>
            <p>Thanks for using TokenTab. Here's a summary of your audit:</p>
            <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">
                Potential savings: $${totalMonthlySavings.toFixed(0)}/mo
              </p>
              <p style="color: #64748b; margin: 8px 0 0 0;">
                $${(totalMonthlySavings * 12).toFixed(0)} per year
              </p>
            </div>
            ${totalMonthlySavings > 500 ? `
            <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #854d0e;">
                <strong>You qualify for a Credex consultation.</strong> Credex sells discounted AI credits that could help you capture even more savings. A member of our team will reach out shortly.
              </p>
            </div>
            ` : ''}
            <p>View your full audit report:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/result/${data.share_token}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Report →
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
              TokenTab — Free AI Spend Audit Tool
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, shareToken: data.share_token })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
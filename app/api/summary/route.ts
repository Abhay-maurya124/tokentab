import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { auditData } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are a financial advisor specializing in SaaS tooling costs for startups.

Given the following AI tool audit data, write a 100-word personalized summary for the user. Be direct, specific, and encouraging. Mention their biggest savings opportunity by name. Do not use filler phrases like "In conclusion" or "It's worth noting."

Audit data:
${JSON.stringify(auditData, null, 2)}

Respond with only the summary paragraph. No headers, no bullet points.`,
        },
      ],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return NextResponse.json({
      summary: 'Based on your current AI tool usage, there are opportunities to optimize your spend. Review the recommendations below to see where you can save money by switching plans or consolidating tools.',
    })
  }
}
import { runAudit } from '@/lib/auditEngine'

describe('Audit Engine', () => {
  test('flags Cursor Business with 1 seat as overkill — should save $20/mo', () => {
    const result = runAudit({
      tools: [{ tool: 'cursor', plan: 'Business', seats: 1, monthlySpend: 40 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.totalMonthlySavings).toBe(20)
    expect(result.recommendations[0].recommendedAction).toBe('Downgrade to Pro')
  })

  test('returns isOptimal true when no savings found', () => {
    const result = runAudit({
      tools: [{ tool: 'cursor', plan: 'Pro', seats: 1, monthlySpend: 20 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.isOptimal).toBe(true)
    expect(result.totalMonthlySavings).toBeLessThan(10)
  })

  test('flags Team plan as overkill for 1 user', () => {
    const result = runAudit({
      tools: [{ tool: 'claude', plan: 'Team', seats: 1, monthlySpend: 30 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.recommendations[0].recommendedAction).toBe('Downgrade to Pro')
    expect(result.totalMonthlySavings).toBe(10)
  })

  test('annual savings equals monthly savings times 12', () => {
    const result = runAudit({
      tools: [{ tool: 'cursor', plan: 'Business', seats: 1, monthlySpend: 40 }],
      teamSize: 1,
      useCase: 'coding',
    })
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
  })

test('shows Credex upsell when savings exceed $500/mo', () => {
    const result = runAudit({
      tools: [
        { tool: 'cursor', plan: 'Business', seats: 2, monthlySpend: 80 },
        { tool: 'chatgpt', plan: 'Team', seats: 2, monthlySpend: 60 },
        { tool: 'claude', plan: 'Free', seats: 1, monthlySpend: 200 },
        { tool: 'github_copilot', plan: 'Business', seats: 3, monthlySpend: 57 },
        { tool: 'gemini', plan: 'Free', seats: 1, monthlySpend: 300 },
      ],
      teamSize: 5,
      useCase: 'coding',
    })
    expect(result.totalMonthlySavings).toBeGreaterThan(500)
    expect(result.showCredexUpsell).toBe(true)
  })
})
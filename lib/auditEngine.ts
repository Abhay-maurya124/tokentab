import { FormState, AuditResult, AuditRecommendation, ToolEntry } from '@/types'

const PRICING: Record<string, Record<string, number>> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 60,
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30,
    enterprise: 50,
  },
  chatgpt: {
    plus: 20,
    team: 30,
    enterprise: 50,
  },
  anthropic_api: {
    pay_as_you_go: 0,
  },
  openai_api: {
    pay_as_you_go: 0,
  },
  gemini: {
    free: 0,
    pro: 20,
    ultra: 30,
  },
  windsurf: {
    free: 0,
    pro: 15,
    teams: 35,
  },
}

function auditTool(entry: ToolEntry, teamSize: number, useCase: string): AuditRecommendation {
  const { tool, plan, seats, monthlySpend } = entry
  const planLower = plan.toLowerCase()
  const officialPrice = PRICING[tool]?.[planLower] ?? 0
  const totalOfficialCost = officialPrice * seats

  if (monthlySpend > totalOfficialCost * 1.1 && totalOfficialCost > 0) {
    const savings = monthlySpend - totalOfficialCost
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Review billing',
      recommendedPlan: plan,
      estimatedSavings: savings,
      reason: `You're paying $${monthlySpend}/mo but the official ${plan} plan for ${seats} seat(s) costs $${totalOfficialCost}/mo. Check for unused seats or billing errors.`,
    }
  }

  if (tool === 'cursor' && planLower === 'business' && seats <= 2) {
    const savings = (PRICING.cursor.business - PRICING.cursor.pro) * seats
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Pro',
      recommendedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Cursor Business is designed for teams. With ${seats} seat(s), Pro ($20/user) gives you the same coding features at half the cost.`,
    }
  }

  if (tool === 'github_copilot' && planLower === 'business' && seats <= 3) {
    const savings = (PRICING.github_copilot.business - PRICING.github_copilot.individual) * seats
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Individual',
      recommendedPlan: 'Individual',
      estimatedSavings: savings,
      reason: `Copilot Business adds admin controls and audit logs. With ${seats} seat(s), Individual ($10/user) covers all core features.`,
    }
  }

  if (tool === 'claude' && planLower === 'team' && seats <= 2) {
    const savings = (PRICING.claude.team - PRICING.claude.pro) * seats
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Pro',
      recommendedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Claude Team requires minimum 2 seats and adds collaboration features. For ${seats} user(s), Pro ($20/user) is sufficient.`,
    }
  }

  if (tool === 'chatgpt' && planLower === 'team' && seats <= 2) {
    const savings = (PRICING.chatgpt.team - PRICING.chatgpt.plus) * seats
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Plus',
      recommendedPlan: 'Plus',
      estimatedSavings: savings,
      reason: `ChatGPT Team adds shared workspaces and admin controls. For ${seats} user(s), Plus ($20/user) covers all AI features.`,
    }
  }

  if (tool === 'github_copilot' && useCase === 'coding') {
    return {
      tool,
      currentSpend: monthlySpend,
      recommendedAction: 'Consider dropping in favour of Cursor',
      recommendedPlan: planLower,
      estimatedSavings: monthlySpend * 0.5,
      reason: `Teams using Cursor often find Copilot redundant. Cursor's inline editing is more capable for most coding workflows. Try running just Cursor for one month.`,
    }
  }

  // Already optimal
  return {
    tool,
    currentSpend: monthlySpend,
    recommendedAction: 'No change needed',
    recommendedPlan: plan,
    estimatedSavings: 0,
    reason: `Your ${tool} setup looks right-sized for ${seats} seat(s) on the ${plan} plan.`,
  }
}

export function runAudit(formState: FormState): AuditResult {
  const { tools, teamSize, useCase } = formState

  const recommendations: AuditRecommendation[] = tools
    .filter(t => t.monthlySpend > 0)
    .map(entry => auditTool(entry, teamSize, useCase))

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedSavings,
    0
  )

  const totalAnnualSavings = totalMonthlySavings * 12
  const isOptimal = totalMonthlySavings < 10
  const showCredexUpsell = totalMonthlySavings > 500

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
    showCredexUpsell,
  }
}
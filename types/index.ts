export type ToolName =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

export interface ToolEntry {
  tool: ToolName
  plan: string
  seats: number
  monthlySpend: number
}

export interface FormState {
  tools: ToolEntry[]
  teamSize: number
  useCase: UseCase
}

export interface AuditRecommendation {
  tool: ToolName
  currentSpend: number
  recommendedAction: string
  recommendedPlan: string
  estimatedSavings: number
  reason: string
}

export interface AuditResult {
  recommendations: AuditRecommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  isOptimal: boolean
  showCredexUpsell: boolean
  summary?: string
}
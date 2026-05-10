import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: Promise<{ token: string }>
}


async function getResult(token: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('audit_data, total_monthly_savings, created_at, share_token')
      .eq('share_token', token)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const data = await getResult(token)
  if (!data) return { title: 'Report not found — TokenTab' }

  const savings = data.total_monthly_savings ?? 0
  return {
    title: `AI Spend Audit — Save $${savings.toFixed(0)}/mo | TokenTab`,
    description: `This AI spend audit found $${savings.toFixed(0)}/month in potential savings. Run your free audit at TokenTab.`,
    openGraph: {
      title: `AI Spend Audit — Save $${savings.toFixed(0)}/mo`,
      description: `Free AI spend audit tool. Found $${savings.toFixed(0)}/month in savings.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `AI Spend Audit — Save $${savings.toFixed(0)}/mo`,
      description: `Free AI spend audit tool. Found $${savings.toFixed(0)}/month in savings.`,
    },
  }
}

function formatToolName(tool: string): string {
  return tool.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
export default async function ResultPage({ params }: Props) {
  const { token } = await params
  const data = await getResult(token)

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report not found</h1>
          <p className="text-gray-500 mb-6">This audit link may have expired or is invalid.</p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Run your own audit →
          </a>
        </div>
      </div>
    )
  }

  const savings = data.total_monthly_savings ?? 0
  const recommendations = (data.audit_data?.recommendations ?? []).filter(
    (rec: any) => rec.currentSpend > 0
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            TokenTab — AI Spend Audit
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Shared Audit Report</h1>
        </div>

        {/* Hero savings */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 mb-6 text-center shadow">
          <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Potential savings</p>
          <p className="text-5xl font-bold mb-1">
            ${Number(savings).toFixed(0)}
            <span className="text-2xl font-normal">/mo</span>
          </p>
          <p className="text-blue-200 text-sm mt-1">
            ${(Number(savings) * 12).toFixed(0)} per year
          </p>
        </div>

        {/* Breakdown */}
        {recommendations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Breakdown by tool</h2>
            </div>
            {recommendations.map((rec: any) => (
              <div key={rec.tool} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-800">
                    {formatToolName(rec.tool)}
                  </p>
                  {rec.estimatedSavings > 0 ? (
                    <span className="text-green-600 font-semibold text-sm">
                      Save ${rec.estimatedSavings.toFixed(0)}/mo
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Optimal</span>
                  )}
                </div>
                <p className="text-sm text-blue-600 font-medium">{rec.recommendedAction}</p>
                <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
          <p className="font-semibold text-gray-800 mb-1">Want to audit your own AI spend?</p>
          <p className="text-gray-500 text-sm mb-4">Free, no login required. Takes 2 minutes.</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Run my free audit →
          </a>
        </div>

      </div>
    </div>
  )
}
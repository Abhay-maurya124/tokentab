'use client'

import { useState } from 'react'
import SpendForm from '@/components/SpendForm'
import LeadCapture from '@/components/LeadCapture'
import { FormState, AuditResult } from '@/types'
import { runAudit } from '@/lib/auditEngine'

type Stage = 'form' | 'results' | 'capture' | 'done'

function formatToolName(tool: string): string {
  return tool
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('form')
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  async function handleFormSubmit(state: FormState) {
    const result = runAudit(state)
    setFormState(state)
    setAuditResult(result)
    setStage('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setSummaryLoading(true)
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData: result }),
      })
      const data = await res.json()
      setSummary(data.summary)
    } catch {
      setSummary('Review the breakdown below to see where you can optimize your AI tool spend.')
    } finally {
      setSummaryLoading(false)
    }
  }

  function handleLeadComplete(token: string) {
    setShareToken(token)
    setStage('done')
  }

  function resetAll() {
    setStage('form')
    setAuditResult(null)
    setFormState(null)
    setShareToken(null)
    setSummary('')
  }

  if (stage === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SpendForm onSubmit={handleFormSubmit} />
      </div>
    )
  }

  if (!auditResult || !formState) return null

  const visibleRecs = auditResult.recommendations.filter(
    rec => rec.currentSpend > 0
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {stage === 'capture' && (
          <LeadCapture
            auditResult={auditResult}
            formState={formState}
            onComplete={handleLeadComplete}
            onSkip={() => setStage('results')}
          />
        )}

        {/* Hero savings */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 mb-6 text-center shadow">
          <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Potential savings</p>
          <p className="text-5xl font-bold mb-1">
            ${auditResult.totalMonthlySavings.toFixed(0)}
            <span className="text-2xl font-normal">/mo</span>
          </p>
          <p className="text-blue-200 text-sm mt-1">
            ${auditResult.totalAnnualSavings.toFixed(0)} per year
          </p>
        </div>

        {/* AI Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">AI Summary</p>
          {summaryLoading ? (
            <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
          )}
        </div>

        {/* Optimal message */}
        {auditResult.isOptimal && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 text-center">
            <p className="text-green-800 font-semibold">You are spending well.</p>
            <p className="text-green-600 text-sm mt-1">
              Your current AI tool setup looks right-sized. No major savings found.
            </p>
          </div>
        )}

        {/* Credex upsell */}
        {auditResult.showCredexUpsell && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-6">
            <p className="font-semibold text-yellow-900">
              You could save over $500/mo — Credex can help.
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              Credex sells discounted AI credits for Cursor, Claude, and ChatGPT Enterprise
              sourced from companies that overforecast. Book a free consultation.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Talk to Credex →
            </a>
          </div>
        )}

        {/* Per tool breakdown */}
        {visibleRecs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Breakdown by tool</h2>
            </div>
            {visibleRecs.map(rec => (
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

        {/* Share section */}
        {stage === 'done' && shareToken && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <p className="font-semibold text-gray-800 mb-1">Share your audit</p>
            <p className="text-gray-500 text-sm mb-3">
              Your report has a unique public URL. Company name and email are not shown.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/result/${shareToken}`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/result/${shareToken}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {stage === 'results' && (
            <button
              onClick={() => setStage('capture')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Get my report by email →
            </button>
          )}
          <button
            onClick={resetAll}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
          >
            ← Edit my inputs
          </button>
        </div>

      </div>
    </div>
  )
}
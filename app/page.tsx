'use client'

import { useState } from 'react'
import SpendForm from '@/components/SpendForm'
import { FormState, AuditResult } from '@/types'
import { runAudit } from '@/lib/auditEngine'

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)

  function handleSubmit(state: FormState) {
    const result = runAudit(state)
    setFormState(state)
    setAuditResult(result)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (auditResult && formState) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">

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

          {auditResult.isOptimal && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 text-center">
              <p className="text-green-800 font-semibold">You're spending well.</p>
              <p className="text-green-600 text-sm mt-1">
                Your current AI tool setup looks right-sized. No major savings found.
              </p>
            </div>
          )}

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

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Breakdown by tool</h2>
            </div>
            {auditResult.recommendations.map(rec => (
              <div key={rec.tool} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-800 capitalize">
                    {rec.tool.replace('_', ' ')}
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

          
          <button
            onClick={() => setAuditResult(null)}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
          >
            ← Edit my inputs
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SpendForm onSubmit={handleSubmit} />
    </div>
  )
}
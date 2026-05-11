'use client'

import { useState } from 'react'
import { AuditResult, FormState } from '@/types'

interface LeadCaptureProps {
  auditResult: AuditResult
  formState: FormState
  onComplete: (shareToken: string) => void
  onSkip: () => void
}

export default function LeadCapture({ auditResult, formState, onComplete, onSkip }: LeadCaptureProps) {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email) {
      setError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName,
          role,
          teamSize: formState.teamSize,
          auditData: { ...auditResult, honeypot },
          totalMonthlySavings: auditResult.totalMonthlySavings,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }

      onComplete(data.shareToken)
    } catch {
  setError('Something went wrong. Please try again.')
} finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Get your full report
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email to receive the audit and a shareable link.
          {auditResult.totalMonthlySavings > 500 && (
            <span className="text-yellow-700 font-medium"> We&apos;ll also reach out about Credex savings credits.</span>
          )}
        </p>

        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Company name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Your role <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Engineering Manager"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Get my report →'}
          </button>

          <button
            onClick={onSkip}
            className="w-full text-gray-400 hover:text-gray-600 text-sm py-1 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { FormState, ToolEntry, ToolName, UseCase } from '@/types'

const TOOLS: { id: ToolName; label: string; plans: string[] }[] = [
    {
        id: 'cursor',
        label: 'Cursor',
        plans: ['Hobby', 'Pro', 'Business', 'Enterprise'],
    },
    {
        id: 'github_copilot',
        label: 'GitHub Copilot',
        plans: ['Individual', 'Business', 'Enterprise'],
    },
    {
        id: 'claude',
        label: 'Claude (Anthropic)',
        plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API Direct'],
    },
    {
        id: 'chatgpt',
        label: 'ChatGPT (OpenAI)',
        plans: ['Plus', 'Team', 'Enterprise', 'API Direct'],
    },
    {
        id: 'anthropic_api',
        label: 'Anthropic API Direct',
        plans: ['Pay as you go'],
    },
    {
        id: 'openai_api',
        label: 'OpenAI API Direct',
        plans: ['Pay as you go'],
    },
    {
        id: 'gemini',
        label: 'Gemini (Google)',
        plans: ['Free', 'Pro', 'Ultra', 'API'],
    },
    {
        id: 'windsurf',
        label: 'Windsurf',
        plans: ['Free', 'Pro', 'Teams'],
    },
]

const USE_CASES: { id: UseCase; label: string }[] = [
    { id: 'coding', label: 'Coding' },
    { id: 'writing', label: 'Writing' },
    { id: 'data', label: 'Data Analysis' },
    { id: 'research', label: 'Research' },
    { id: 'mixed', label: 'Mixed' },
]

const DEFAULT_FORM: FormState = {
    tools: [],
    teamSize: 1,
    useCase: 'coding',
}

interface SpendFormProps {
    onSubmit: (state: FormState) => void
}

export default function SpendForm({ onSubmit }: SpendFormProps) {
    const [form, setForm] = useState<FormState>(DEFAULT_FORM)
    const [selectedTools, setSelectedTools] = useState<ToolName[]>([])
    const [rawInputs, setRawInputs] = useState<Record<string, string>>({})
    const [rawTeamSize, setRawTeamSize] = useState<string>(String(DEFAULT_FORM.teamSize))
   useEffect(() => {
    const saved = localStorage.getItem('tokentab_form')
    if (saved) {
        const parsed = JSON.parse(saved) as FormState
        // eslint-disable-next-line react-hooks/set-state-in-effect

        setForm(parsed)
        // eslint-disable-next-line react-hooks/set-state-in-effect

        setSelectedTools(parsed.tools.map((t: ToolEntry) => t.tool))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

    useEffect(() => {
        localStorage.setItem('tokentab_form', JSON.stringify(form))
    }, [form])

    function toggleTool(toolId: ToolName) {
        if (selectedTools.includes(toolId)) {
            setSelectedTools(prev => prev.filter(t => t !== toolId))
            setForm(prev => ({
                ...prev,
                tools: prev.tools.filter(t => t.tool !== toolId),
            }))
        } else {
            setSelectedTools(prev => [...prev, toolId])
            const toolMeta = TOOLS.find(t => t.id === toolId)!
            setForm(prev => ({
                ...prev,
                tools: [
                    ...prev.tools,
                    {
                        tool: toolId,
                        plan: toolMeta.plans[0],
                        seats: 1,
                        monthlySpend: 0,
                    },
                ],
            }))
        }
    }

    function updateToolEntry(toolId: ToolName, field: keyof ToolEntry, value: string | number) {
        setForm(prev => ({
            ...prev,
            tools: prev.tools.map(t =>
                t.tool === toolId ? { ...t, [field]: value } : t
            ),
        }))
    }

    function handleRawInput(toolId: ToolName, field: 'seats' | 'monthlySpend', raw: string) {
        const key = `${toolId}_${field}`
        setRawInputs(prev => ({ ...prev, [key]: raw }))
        const num = parseFloat(raw)
        if (!isNaN(num) && num >= 0) {
            updateToolEntry(toolId, field, field === 'seats' ? Math.max(1, Math.floor(num)) : num)
        }
    }

    function getRawValue(toolId: ToolName, field: 'seats' | 'monthlySpend', fallback: number): string {
        const key = `${toolId}_${field}`
        return rawInputs[key] !== undefined ? rawInputs[key] : String(fallback)
    }

    function handleSubmit() {
        if (form.tools.length === 0) {
            alert('Please select at least one tool.')
            return
        }
        onSubmit(form)
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Audit Your AI Spend
            </h1>
            <p className="text-center text-gray-500 mb-8">
                Select the tools you pay for and we&apos;ll find where you&apos;re overspending.
            </p>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Your Team</h2>
                <div className="flex gap-6 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Team size</label>
                        <input
                            type="number"
                            min={1}
                            value={rawTeamSize}
                            onChange={e => {
                                const val = e.target.value
                                setRawTeamSize(val)
                                const num = parseInt(val)
                                if (!isNaN(num) && num >= 1) {
                                    setForm(prev => ({ ...prev, teamSize: num }))
                                }
                            }}
                            onFocus={e => e.target.select()}
                            placeholder="1"
                            className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Primary use case</label>
                        <select
                            value={form.useCase}
                            onChange={e => setForm(prev => ({ ...prev, useCase: e.target.value as UseCase }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {USE_CASES.map(uc => (
                                <option key={uc.id} value={uc.id}>{uc.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Which tools do you pay for?</h2>
                <div className="grid grid-cols-2 gap-3">
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => toggleTool(tool.id)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedTools.includes(tool.id)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                }`}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            {form.tools.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-gray-800 mb-4">Plan details</h2>
                    <div className="flex flex-col gap-6">
                        {form.tools.map(entry => {
                            const toolMeta = TOOLS.find(t => t.id === entry.tool)!
                            return (
                                <div key={entry.tool} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <p className="font-medium text-gray-800 mb-3">{toolMeta.label}</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Plan</label>
                                            <select
                                                value={entry.plan}
                                                onChange={e => updateToolEntry(entry.tool, 'plan', e.target.value)}
                                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {toolMeta.plans.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Seats</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={getRawValue(entry.tool, 'seats', entry.seats)}
                                                onChange={e => handleRawInput(entry.tool, 'seats', e.target.value)}
                                                onFocus={e => e.target.select()}
                                                placeholder="1"
                                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Monthly spend ($)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={getRawValue(entry.tool, 'monthlySpend', entry.monthlySpend)}
                                                onChange={e => handleRawInput(entry.tool, 'monthlySpend', e.target.value)}
                                                onFocus={e => e.target.select()}
                                                placeholder="0"
                                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-base"
            >
                Run my audit →
            </button>
        </div>
    )
}
# TokenTab — Free AI Spend Audit Tool

TokenTab helps startup founders and engineering managers find out if they're overpaying for AI tools. Enter what you pay for Cursor, Claude, ChatGPT, Copilot, and more — get an instant breakdown of where you're overspending and what to switch to.

Built for Credex as a free lead-generation audit tool.

## Quick Start

```bash
git clone https://github.com/Abhay-maurya124/tokentab.git
cd tokentab
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key

## Deploy

Live at: 

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) for lead storage
- Anthropic API for personalized audit summaries
- Vercel for deployment

## Decisions

1. **Next.js App Router over Pages Router** — Server components keep the Anthropic API key off the client bundle. API routes handle lead storage and summary generation server-side.
2. **Supabase over Firebase** — Postgres lets us query leads by savings amount, which is how we identify high-value users for Credex follow-up. Firebase document model makes range queries awkward.
3. **Hardcoded audit rules over LLM for math** — Pricing logic must be deterministic and auditable. A finance person should read the rules and agree with them. LLM is used only for the summary paragraph where natural language adds value.
4. **localStorage for form persistence** — Users should not lose their inputs on accidental refresh. No auth needed for this; client-side persistence is sufficient for a single-session tool.
5. **Resend over AWS SES** — Resend free tier covers 100 emails/day which is enough for launch. Simpler API and better deliverability for a new domain than SES without prior warm-up.
# Xylo — AI Workflow Automation for Boutique RIA Practices

> An end-to-end SaaS prototype that automates the most time-consuming part of a
> Registered Investment Advisor's client intake: turning a new client's
> financial profile into a complete set of compliance-ready advisory documents
> in seconds, using Claude.

**Author:** _Prasmit Pokhrel_ · _p.pokhrel@eagles.oc.edu_
**Status:** Working prototype (live AI backend deployed on Supabase)
**Domain:** WealthTech / Registered Investment Advisors (RIAs)

---

## The problem

Boutique RIA firms — independent advisory practices, often 1–10 advisors — are
held to the same fiduciary and documentation standards as large institutions but
without the back-office staff. For **every new client**, an advisor manually
produces a stack of onboarding documents:

- a **Client Risk Profile** (risk tolerance, capacity, recommended allocation)
- a **Goals Brief** (retirement and life goals, prioritized)
- a **Planning Meeting Agenda**
- a **draft Investment Policy Statement (IPS)** — the cornerstone compliance artifact

Done by hand, this is several hours of repetitive, error-prone writing per
client, pulling from the same intake facts each time. It doesn't scale, and it's
exactly the kind of structured, document-heavy knowledge work that LLMs are good
at — *if* you wrap them in the right workflow and guardrails.

## The solution

Xylo is a guided intake application with an AI document-generation engine behind
it. An advisor walks a client (or themselves) through a five-step wizard; on
submit, the system fans out to Claude and returns four polished, advisor-ready
documents that can be reviewed in-app and downloaded as formatted PDFs.

```
Intake wizard ─▶ structured client profile ─▶ Claude (×4 in parallel) ─▶ review & export PDFs
```

### What it does, step by step

1. **Basic Information** — name, age, employment, marital status, contact.
2. **Financial Situation** — income, total assets, investment experience.
3. **Risk Assessment** — a 4-question instrument; each answer is scored 1–4,
   averaged into a `riskScore` out of 4.0, and mapped to a risk profile
   (Conservative → Aggressive). *This is deterministic, not AI — risk
   classification should be auditable, not a model guess.*
4. **Goals & Objectives** — retirement target plus arbitrary prioritized goals.
5. **Review & Generate** — the advisor reviews the captured profile and triggers
   generation. Four documents are produced **in parallel** and rendered as
   formatted Markdown, each downloadable as a **PDF**.

## Why this maps to a Forward Deployed AI Engineering role

Forward Deployed Engineering is about embedding into a specific customer's domain
and shipping a working AI system end-to-end — not a notebook, a *product*. This
project was built in that spirit:

| FDE competency | How it shows up here |
|---|---|
| **Domain modeling** | Encoded a real RIA intake workflow and its output artifacts (IPS, risk profile) rather than a generic "chatbot." |
| **End-to-end ownership** | Frontend, backend, AI prompting, deployment, cost tuning, PDF export, and a regression test — all shipped. |
| **Right tool for each job** | Risk scoring is deterministic code (auditable); only the *narrative document drafting* is delegated to the LLM. |
| **Production guardrails** | API key isolated server-side, CORS, JWT-aware function, graceful error surfacing to the UI. |
| **Cost engineering** | Tuned the AI layer to cut output tokens **~80%** per generation without losing document completeness (see below). |
| **Pragmatism & iteration** | Diagnosed and fixed real deployment issues (CORS, key management) and real output issues (Markdown rendering, PDF layout) the way you would on-site with a customer. |

## Tech stack

**Frontend** (browser)
- React 18 + TypeScript, built with Vite 6
- Tailwind CSS 4 + shadcn/ui (Radix primitives)
- `react-markdown` + `remark-gfm` to render generated documents
- `jspdf` + `jspdf-autotable` + `marked` for client-side Markdown → PDF export

**Backend** (Supabase cloud, serverless)
- Supabase Edge Functions on the Deno runtime
- Hono (HTTP routing + CORS)
- `@anthropic-ai/sdk` calling **Claude Haiku 4.5** for document generation

**Platform / tooling**
- Supabase (function hosting + encrypted secrets management)
- Supabase CLI for deploys; `tsx` for a headless PDF-layout regression test

A deeper write-up of the system design, request lifecycle, security model, AI
pipeline, and key decisions lives in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Architecture at a glance

```
┌────────────────────┐     HTTPS POST          ┌─────────────────────────┐     x-api-key      ┌────────────┐
│  React SPA (Vite)  │  + anon key (public)    │  Supabase Edge Function │   (server-side)    │  Anthropic │
│  intake + review   │ ──────────────────────▶ │  Deno · Hono            │ ─────────────────▶ │  Claude    │
│  PDF export        │ ◀────────────────────── │  reads ANTHROPIC_API_KEY│ ◀───────────────── │  Haiku 4.5 │
└────────────────────┘   JSON: 4 documents     │  from encrypted secret  │   4 docs (parallel)└────────────┘
                                               └─────────────────────────┘
```

The advisor's machine only ever holds the **public anon key**. The **Anthropic
key never leaves Supabase** — the browser cannot see it. This server-side
mediation is the whole reason a backend exists rather than calling Claude
directly from React.

## AI engineering highlights

- **Parallel fan-out:** the four documents are generated concurrently with
  `Promise.all`, so total latency ≈ the slowest single call, not the sum.
- **Deterministic vs. generative split:** numeric risk scoring is plain code;
  the LLM only drafts prose. Compliance-relevant numbers stay auditable.
- **Cost-optimized prompting:** a `system` prompt enforces concise,
  information-dense output (bullets/compact tables, no boilerplate), and
  `max_tokens` is capped at 1200. Combined, this took a full four-document
  generation from **~55 KB to ~9 KB of output (~80% fewer output tokens)** with
  no loss of section coverage.
- **Graceful failure:** missing/invalid keys and model errors are caught and
  surfaced as readable messages in the UI instead of silent failures.

## Getting started

```bash
# 1. Install
npm install

# 2. Run the frontend (http://localhost:5173)
npm run dev
```

The deployed Supabase function powers document generation out of the box. To run
or modify the backend yourself, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**
for deploy steps and the secret it requires (`ANTHROPIC_API_KEY`).

## Deployment

Xylo ships as **two independent pieces**, deliberately split so the API key never
reaches the client:

- **Frontend** → **Vercel** (static Vite build). Holds **no secrets** — needs no
  environment variables.
- **Backend** → **Supabase Edge Function** (Deno). Holds the `ANTHROPIC_API_KEY`
  as an encrypted secret; only this server-side code can read it.

```bash
# Backend (Supabase) — deploy the function + set the secret
npx supabase link --project-ref <your-project-ref>
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase functions deploy make-server-45e67790 --project-ref <your-project-ref>

# Frontend (Vercel) — from the project root
npx vercel            # preview deploy (accept the auto-detected Vite settings)
npx vercel --prod     # production
```

Because the key lives only on Supabase, **no environment variables are set on
Vercel** — a smaller attack surface. The remaining hardening (Anthropic spend
limit, locking CORS to your domain) plus full step-by-step instructions,
GitHub auto-deploy, and troubleshooting are in the
**[Deployment section of docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#deployment)**.

## Roadmap

The current build proves the core loop (intake → AI generation → review →
export). Natural next increments, in priority order:

1. **Persistence & advisor accounts** — store clients and generated docs
   (Supabase Postgres; a key-value store is already scaffolded), add auth so a
   firm has its own workspace.
2. **Editable drafts + regeneration** — let advisors tweak inputs and
   regenerate a single document on demand (additional ~75% cost saving when only
   one doc is needed).
3. **Compliance audit trail** — version every generated IPS with the exact
   inputs and model used, for examination readiness.
4. **Firm-specific templating** — let each practice encode its house style,
   model lineup, and allocation bands so output matches their book.
5. **Integrations** — push outputs into the firm's CRM / custodian (Redtail,
   Wealthbox, Schwab) and e-signature.

## What this project demonstrates

End-to-end delivery of a domain-specific AI product: real workflow modeling, a
deployed serverless AI backend, sound secret handling, measurable cost
engineering, and the kind of hands-on debugging and iteration a Forward Deployed
Engineer does alongside a customer.

## If I Had More Time

This build deliberately proves the core loop end-to-end. With more runway, here's
where I'd take it to make it a real product an RIA firm could adopt — roughly in
the order I'd build them.

### 1. A persistent client database (the biggest gap)

Right now a generated document set lives only in the browser session — close the tab and it's gone. The first thing I'd add is **persistence** so that once a client's information is entered and their documents are generated, everything is saved and retrievable later :

- **Schema (Supabase Postgres):**
  - `firms` (the practice / tenant)
  - `advisors` (users, belong to a firm)
  - `clients` (the intake profile: basic info, financials, risk score, goals)
  - `documents` (each generated doc: type, markdown content, the **exact inputs
    and model** used to produce it, `created_at`, `version`)
- **Advisor dashboard:** a searchable list of past clients — reopen a client to
  view their saved profile and previously generated documents, no regeneration
  needed (and no repeat API cost).
- **Resume & re-generate:** edit a saved client's inputs and regenerate a single
  document on demand.

The plumbing is already half-there: the backend ships with a Supabase key-value
store helper (`kv_store`) that's currently unused — persistence is the natural
next wire-up.

### 2. Advisor accounts & multi-tenancy

Authentication (Supabase Auth) so each firm has its own private workspace, with
**Row-Level Security** ensuring an advisor only ever sees their firm's clients.
This also lets me re-enable `verify_jwt` and properly close the public endpoint —
turning the current open demo into a access-controlled application.

### 3. Compliance audit trail

Because the IPS is a regulated artifact, I'd **version every document** and store
a tamper-evident record of who generated what, from which inputs, with which
model and prompt — so the firm is examination-ready and can prove how any client
deliverable was produced.

### 4. Output quality & evaluation

- An **eval harness** scoring generated documents against a rubric (completeness,
  required disclosures, tone) so prompt/model changes are measured, not guessed.
- A **human-in-the-loop review** step: advisors edit drafts inline, and those
  edits become few-shot examples that improve future generations for that firm.

### 5. Firm-specific intelligence (RAG)

Let each practice upload its own templates, model lineup, and allocation
philosophy, and **retrieve** from them at generation time so output matches the
firm's house style and compliance language — not a generic default.

### 6. Integrations & delivery

Push finished documents straight into the tools advisors already use — CRMs
(Redtail, Wealthbox), custodians (Schwab, Fidelity), and **e-signature** — so the
onboarding packet flows from intake to a signed IPS without leaving the app.

### 7. Productionization

Observability and cost dashboards (tokens/latency per firm), structured logging,
per-firm rate limiting, automated tests in CI, and staged preview → production
deploys. The groundwork is started — there's already a headless regression test
for the PDF engine and a clean two-environment deploy split.

> **Why these, in this order:** persistence and auth unlock everything else
> (you can't have an audit trail or a firm workspace without stored data), and
> they convert the current single-session demo into a multi-user SaaS. The later
> items — evals, RAG, integrations — are what turn a working tool into something
> a firm would pay for and trust with regulated work.

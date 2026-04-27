# FlagBase 🚩

> A high-performance, self-hosted feature flag & rollout manager for developer teams. Ship faster, release safer.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green?style=flat-square&logo=postgresql)](https://neon.tech)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## What is FlagBase?

FlagBase is an open-source, self-hostable alternative to LaunchDarkly and Split.io. It lets you create and evaluate feature flags with zero infrastructure overhead.

We built this for teams who want a straightforward way to manage their rollout strategy:

- **Environments** — Separate states for Production, Staging, and Development.
- **Targeting** — Target users based on any custom attribute.
- **Gradual Rollouts** — Percentage-based releases with deterministic bucketing.
- **Audit Logging** — Keep track of every change with simple state diffs.
- **Drizzle Stack** — Lightweight data fetching using Drizzle ORM and Neon.

---

## Live Demo

🔗 **[flag-base.vercel.app](https://flagbase.app)**

| Role | Email | Password |
|------|-------|----------|
| Owner | `demo@flagbase.dev` | `demo1234` |

---

## Features

### Core
- **Multi-environment flag management** — Production, Staging, Development with independent status.
- **Targeting rules engine** — Priority-based rules with flexible condition logic.
- **Deterministic percentage rollouts** — Stable bucketing ensures user consistency during gradual releases.
- **Flag types** — Boolean, String, Number, JSON.
- **Audit trail** — Every flag change logged with actor, timestamp, and full state diff.

### Access Control
- **Multi-tenant** — Organization-level isolation for flags, environments, and members.
- **Role-based access** — OWNER → ADMIN → EDITOR → VIEWER with specific dashboard permissions.
- **Secure API keys** — Scoped per environment, stored as SHA-256 hashes, revealed only once.

### Developer Experience
- **REST Evaluation API** — Evaluate multiple flags in a single POST request with user context.
- **Modern Stack** — Next.js 15, Drizzle ORM, and Neon Serverless for sub-100ms response times.
- **Type-safe primitives** — Full TypeScript strict mode across the entire codebase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (formerly NextAuth - JWT, Credentials) |
| UI Components | Radix UI + Lucide React |

---

## System Design

```
┌─────────────────┐     ┌──────────────────────────────────┐
│   Dashboard UI  │     │         Your Application          │
│ (Next.js 15 App)│     │   calls POST /api/evaluate with   │
│                 │     │   x-api-key header + user context  │
└────────┬────────┘     └─────────────────┬────────────────┘
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js API Routes                    │
│           (Drizzle ORM — Direct SQL Access)              │
│                                                          │
│  /api/flags/*     — CRUD (NextAuth, org-scoped)          │
│  /api/evaluate    — Flag eval (SHA-256 Key Auth)         │
│  /api/api-keys    — Secure key generation                │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         ▼                                    ▼
┌─────────────────┐                ┌──────────────────────┐
│   Rule Engine   │                │     Audit Logger      │
│                 │                │                       │
│ matchConditions │                │ Drizzle-powered log   │
│ getBucket()     │                │ of every flag change  │
│ evaluateFlag()  │                │ with state diffs      │
└────────┬────────┘                └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL on Neon (Serverless)              │
│                                                          │
│  Organizations → Flags → TargetingRules                  │
│  Environments  → FlagOverrides                           │
│  Users → OrgMembers (RBAC)                               │
│  ApiKeys (SHA-256) → AuditLogs                           │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [Vercel](https://vercel.com) account (free)

### Local Development

**1. Clone the repo**
```bash
git clone https://github.com/Navodit-AI/FlagBase.git
cd FlagBase
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@neon-pooled-host/dbname?sslmode=require"
AUTH_SECRET="generate with: npx auth secret"
```

**4. Start the dev server**
```bash
npm run dev
```

Visit `http://localhost:3000/register` to create your first organization.

---

## Using the Eval API

Once you have an API key (Dashboard → API Keys → Generate), call the eval endpoint from any app:

```bash
curl -X POST https://your-app.vercel.app/api/evaluate \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "keys": ["new-checkout", "dark-mode"],
    "context": {
      "userId": "user_123",
      "email": "alice@acme.com",
      "plan": "pro"
    }
  }'
```

**Response:**
```json
{
  "new-checkout": true,
  "dark-mode": false
}
```

---

## Folder Structure

```
flagbase/
├── app/
│   ├── (auth)/          # Registration and Login
│   ├── (dashboard)/     # Premium Management UI
│   └── api/             # Secure Drizzle-based API Routes
├── lib/
│   ├── db.ts            # Drizzle client & Schema exports
│   ├── auth.ts          # Auth.js configuration
│   └── env-context.tsx  # Dynamic environment management
├── components/
│   ├── flags/           # RuleEditor, Targeting, Overrides
│   ├── layout/          # Premium Dashboard Navigation
│   └── ui/              # shadcn components
└── middleware.ts        # Route protection & Session guards
```

---

## Why I Built This

Most feature flag tools cost $200–$500/month for small teams. FlagBase is a fully self-hostable alternative that you can deploy for free on Vercel + Neon in under 10 minutes. It's built for engineers who want total control over their rollout infrastructure without the enterprise price tag.

---

## License

MIT © [Navodit](https://github.com/Navodit-AI)

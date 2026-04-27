# FlagBase 🚩

> A self-hosted feature flag & rollout manager for developer teams. Ship faster, release safer.

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green?style=flat-square&logo=postgresql)](https://neon.tech)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## What is FlagBase?

FlagBase is an open-source, self-hosted alternative to LaunchDarkly and Split.io. It lets engineering teams create, manage, and evaluate feature flags with:

- **Per-environment overrides** — separate state for production, staging, and development
- **Audience targeting** — show features to specific users based on attributes like email, plan, or region
- **Percentage rollouts** — gradually release to 5%, 20%, 100% of users using deterministic hashing
- **Audit logging** — full append-only history of every change, with before/after diffs
- **SDK-ready eval API** — call `/api/evaluate` from any app using an API key

---

## Live Demo

🔗 **[flag-base.vercel.app](https://flag-base.vercel.app)**

| Role | Email | Password |
|------|-------|----------|
| Owner | `demo@flagbase.dev` | `demo1234` |

---

## Features

### Core
- **Multi-environment flag management** — production, staging, development with independent on/off state
- **Targeting rules engine** — condition-based rules with operators: `equals`, `contains`, `ends_with`, `starts_with`, `in`, `not_in`
- **Deterministic percentage rollouts** — same user always gets the same variant (murmurhash-based bucketing)
- **Flag types** — Boolean, String, Number, JSON
- **Audit trail** — every flag change logged with actor, timestamp, and full diff

### Access Control
- **Multi-tenant** — each organization has isolated flags, environments, and members
- **Role-based access** — OWNER → ADMIN → EDITOR → VIEWER with enforced permissions
- **API key management** — scoped per environment, hashed with bcrypt, never stored in plaintext

### Developer Experience
- **REST eval API** — evaluate multiple flags in a single request with user context
- **Consistent bucketing** — percentage rollouts use `murmurhash(flagKey:userId) % 100` for stability
- **Type-safe responses** — flags are returned as their declared type (boolean, number, object)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (JWT, credentials) |
| Deployment | Vercel + Neon (both free tier) |

---

## System Design

```
┌─────────────────┐     ┌──────────────────────────────────┐
│   Dashboard UI  │     │         Your Application          │
│  (Next.js App)  │     │   calls POST /api/evaluate with   │
│                 │     │   x-api-key header + user context  │
└────────┬────────┘     └─────────────────┬────────────────┘
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js API Routes                    │
│                                                          │
│  /api/flags/*     — CRUD (JWT auth, org-scoped)         │
│  /api/evaluate    — Flag eval (API key auth)             │
│  /api/auth/*      — Register, login (NextAuth)           │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         ▼                                    ▼
┌─────────────────┐                ┌──────────────────────┐
│   Rule Engine   │                │     Audit Logger      │
│                 │                │                       │
│ matchConditions │                │ Append-only log of    │
│ getBucket()     │                │ every flag change     │
│ evaluateFlag()  │                │ with before/after     │
└────────┬────────┘                └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL on Neon (Serverless)              │
│                                                          │
│  Organizations → Flags → TargetingRules                  │
│  Environments  → FlagOverrides                           │
│  Users → OrgMembers (RBAC)                               │
│  ApiKeys (bcrypt hashed) → AuditLogs                     │
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
DIRECT_URL="postgresql://user:password@neon-direct-host/dbname?sslmode=require"
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Get your Neon connection strings from [neon.tech](https://neon.tech) → your project → Connection Details.
- `DATABASE_URL` → pooled connection string
- `DIRECT_URL` → direct (unpooled) connection string

**4. Run database migrations**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**5. Start the dev server**
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

Flags are returned as their declared type — booleans as `true/false`, numbers as numbers, JSON as objects.

---

## How Percentage Rollouts Work

FlagBase uses **deterministic bucket assignment** via murmurhash:

```
bucket = murmurhash(`${flagKey}:${userId}`) % 100
```

This means:
- The same user always lands in the same bucket for a given flag
- You can safely increase rollout percentage (e.g. 10% → 25% → 100%) without users flipping between variants
- No session state or cookies required — purely based on userId + flagKey

---

## Deployment

**Deploy to Vercel in 3 steps:**

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com) → add environment variables
3. Click Deploy — every future `git push` auto-deploys

After deploy, run migrations against your production DB:
```bash
npx prisma migrate deploy
```

---

## Database Schema

Key relationships:

```
Organization
  ├── OrgMembers (User + Role)
  ├── Environments (production, staging, development)
  ├── Flags
  │     ├── TargetingRules (ordered by priority, with conditions + % rollout)
  │     ├── FlagOverrides (per-environment enabled state + value)
  │     └── AuditLogs (append-only change history)
  └── ApiKeys (bcrypt hashed, scoped to environment)
```

---

## Folder Structure

```
flagbase/
├── app/
│   ├── (auth)/          # login, register pages
│   ├── (dashboard)/     # flags, settings, members, api-keys
│   └── api/             # all route handlers
├── lib/
│   ├── engine/          # evaluate.ts, rules.ts, hash.ts
│   ├── auth/            # session helpers, role guards
│   └── prisma.ts        # singleton client
├── components/
│   ├── flags/           # FlagList, RuleEditor, EnvOverrideRow
│   └── ui/              # shadcn components
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── types/
│   └── next-auth.d.ts
└── middleware.ts
```

---

## Roadmap

- [ ] Webhook notifications on flag changes
- [ ] Flag scheduling (auto-enable at a date/time)
- [ ] JavaScript/TypeScript SDK package
- [ ] Usage analytics per flag
- [ ] SAML SSO support

---

## Why I Built This

Most feature flag tools cost $200–$500/month for small teams. FlagBase is a fully self-hostable alternative that you can deploy for free on Vercel + Neon in under 10 minutes. Built as a portfolio project to demonstrate full-stack SaaS architecture including multi-tenancy, RBAC, rule engine design, and audit logging.

---

## License

MIT © [Navodit](https://github.com/Navodit-AI)

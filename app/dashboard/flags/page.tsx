import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, flags as flagsTable, rules as rulesTable } from "@/lib/db"
import { eq, desc, sql } from "drizzle-orm"
import { FlagTable } from "@/components/flags/FlagTable"
import { NewFlagDialog } from "@/components/flags/NewFlagDialog"

export default async function FlagsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  const orgId = (session?.user as any)?.orgId

  // Fetch flags with rule counts using Drizzle
  // This replaces the prisma.flag.findMany with an equivalent fast query
  const flags = await db.select({
    id: flagsTable.id,
    name: flagsTable.name,
    key: flagsTable.key,
    description: flagsTable.description,
    type: flagsTable.type,
    createdAt: flagsTable.createdAt,
    updatedAt: flagsTable.updatedAt,
    _count: {
      rules: sql<number>`(SELECT count(*) FROM "TargetingRule" WHERE "flagId" = ${flagsTable.id})`
    }
  })
  .from(flagsTable)
  .where(eq(flagsTable.orgId, orgId))
  .orderBy(desc(flagsTable.createdAt))

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Feature Flags
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-bold">
            Fine-tune your application behavior in real-time. Control rollouts, run experiments, and target specific users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewFlagDialog />
        </div>
      </div>

      <div className="space-y-6">
        <FlagTable flags={flags} />
      </div>
    </div>
  )
}


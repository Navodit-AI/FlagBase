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
  console.log('[FLAGS_PAGE] Fetching flags for orgId:', orgId)

  let flags: any[] = []
  try {
    flags = await db.select()
      .from(flagsTable)
      .where(eq(flagsTable.orgId, orgId))
      .orderBy(desc(flagsTable.createdAt))
    console.log(`[FLAGS_PAGE] Found ${flags.length} flags`)
  } catch (err: any) {
    console.error('[FLAGS_PAGE] Query failed:', err.message)
  }

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
        <FlagTable flags={flags} orgId={orgId} />
      </div>
    </div>
  )
}


import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import { db, flags as flagsTable, rules as rulesTable, overrides as overridesTable, environments as environmentsTable } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EnvOverrides } from "@/components/flags/EnvOverrides"
import { TargetingRules } from "@/components/flags/TargetingRules"
import { AuditLogTable } from "@/components/flags/AuditLogTable"
import { Flag, Terminal, History, Settings2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function FlagDetailsPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const session = await auth()
  if (!session) redirect('/login')

  const orgId = (session?.user as any)?.orgId

  // 1. Fetch Flag with full data via Drizzle
  const flags = await db.select().from(flagsTable).where(
    and(
      eq(flagsTable.orgId, orgId),
      eq(flagsTable.key, key)
    )
  ).limit(1)

  const flag = flags[0]
  if (!flag) notFound()

  const safeType = flag.type ?? 'BOOLEAN'

  // 2. Fetch related data
  const rules = await db.select().from(rulesTable).where(eq(rulesTable.flagId, flag.id))
  
  // Joins for overrides + env name
  const rawOverrides = await db.select({
    id: overridesTable.id,
    enabled: overridesTable.enabled,
    value: overridesTable.value,
    envId: overridesTable.envId,
    envName: environmentsTable.name
  })
  .from(overridesTable)
  .innerJoin(environmentsTable, eq(overridesTable.envId, environmentsTable.id))
  .where(eq(overridesTable.flagId, flag.id))

  const availableEnvs = await db.select().from(environmentsTable).where(eq(environmentsTable.orgId, orgId))
  
  // Ensure we have the 3 default envs if none exist
  // (In real app, these are created during org setup)

  const formattedOverrides = rawOverrides.map(o => ({
    id: o.id,
    enabled: !!o.enabled,
    value: o.value,
    envId: o.envId,
    env: { id: o.envId, name: o.envName }
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link href="/dashboard/flags" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest w-fit">
          <ArrowLeft size={14} /> Back to Flags
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white font-mono">
                {flag.key}
              </h1>
              <Badge className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20 px-3">
                {flag.type}
              </Badge>
              {flag.archived && (
                <Badge variant="outline" className="border-red-200 text-red-500 bg-red-50 dark:bg-red-900/10">
                  ARCHIVED
                </Badge>
              )}
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {flag.name} — {flag.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-[1.5rem] mb-10 h-auto gap-2">
          <TabsTrigger value="configuration" className="rounded-xl px-8 py-3 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">
            <Settings2 size={16} className="mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="targeting" className="rounded-xl px-8 py-3 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">
            <Terminal size={16} className="mr-2" />
            Targeting Rules
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl px-8 py-3 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">
            <History size={16} className="mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-12 mt-0 outline-none">
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Environment Allocation</h2>
            </div>
            <EnvOverrides 
              flagId={flag.id}
              flagKey={flag.key}
              flagType={safeType}
              initialOverrides={formattedOverrides} 
              availableEnvs={availableEnvs} 
            />
          </section>
        </TabsContent>

        <TabsContent value="targeting" className="mt-0 outline-none">
          <TargetingRules 
            flagKey={flag.key} 
            flagType={safeType}
            initialRules={rules.map(r => ({
              ...r,
              priority: parseInt(r.priority),
              percentage: r.percentage ? parseInt(r.percentage) : null,
              conditions: JSON.parse(r.conditions)
            }))} 
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-0 outline-none">
          <AuditLogTable flagKey={flag.key} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

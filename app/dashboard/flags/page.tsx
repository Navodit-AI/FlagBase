import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Plus, Flag, Search, Filter, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { db, flags as flagsTable } from "@/lib/db"
import { eq, desc } from "drizzle-orm"

export default async function FlagsPage() {
  const session = await auth()
  
  // Note: Drizzle bypass for Prisma engine crash
  const orgId = (session?.user as any)?.orgId
  const flags = await db.select()
    .from(flagsTable)
    .where(eq(flagsTable.orgId, orgId))
    .orderBy(desc(flagsTable.createdAt))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Feature Flags
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Fine-tune your application behavior in real-time. Control rollouts, run experiments, and target specific users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 h-12">
            <Link href="/dashboard/flags/new">
              <Plus className="w-5 h-5 mr-2" />
              New Flag
            </Link>
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            placeholder="Search by name, key, or tag..." 
            className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 outline-none"
          />
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
        <Button variant="ghost" className="rounded-xl px-4 h-11 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Flags Content */}
      {flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-900 group">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
            <Flag className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace is empty</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mt-3 mb-8 leading-relaxed">
            Your feature flags will appear here once created. Start with a simple boolean toggle to test the waters.
          </p>
          <Button asChild className="rounded-full px-10 h-12 bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
            <Link href="/dashboard/flags/new">
              Create First Flag
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {flags.map((flag) => (
            <Link 
              key={flag.id} 
              href={`/dashboard/flags/${flag.id}`}
              className="group relative"
            >
              <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 flex flex-col justify-between overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {flag.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <code className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg uppercase tracking-tight">
                          {flag.key}
                        </code>
                        <span className="text-[10px] uppercase font-bold text-slate-300 dark:text-slate-600 tracking-widest">•</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{flag.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {flag.description || "No description provided for this feature flag."}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between relative z-10">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        ENV
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-500">
                      +2
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors font-semibold text-sm">
                    Manage Rules
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Flag className="w-48 h-48 -mr-16 -mt-16 rotate-12" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Plus, Flag, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function FlagsPage() {
  const session = await auth()
  const orgId = session?.user?.orgId

  const flags = await prisma.flag.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    include: {
      environments: {
        include: {
          environment: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-slate-500 text-sm">Manage rollout and targeting for your application features.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/flags/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Flag
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input placeholder="Search flags..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Flag className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No feature flags yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start by creating your first flag to control your features.</p>
          <Button asChild>
            <Link href="/dashboard/flags/new">
              <Plus className="w-4 h-4 mr-2" />
              Create your first flag
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2">Flag Name</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          
          {/* Flag Rows */}
          {flags.map((flag) => (
            <div key={flag.id} className="grid grid-cols-4 px-6 py-4 border-b last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors items-center">
              <div className="col-span-2">
                <p className="font-medium text-slate-900 dark:text-white">{flag.name}</p>
                <code className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">{flag.key}</code>
              </div>
              <div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                  Active
                </span>
              </div>
              <div className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/flags/${flag.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, apiKeys as keysTable } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Clock, Trash2, Key } from "lucide-react"
import { GenerateKeyDialog } from "@/components/api-keys/GenerateKeyDialog"
import { formatDistanceToNow } from "date-fns"

export default async function ApiKeysPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const orgId = (session?.user as any)?.orgId
  const keys = await db.select().from(keysTable).where(eq(keysTable.orgId, orgId)).orderBy(desc(keysTable.createdAt))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            API Keys
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Authenticate your server-side and client-side SDKs with these secure environment-specific keys.
          </p>
        </div>
        <GenerateKeyDialog />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        {keys.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <Key className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No keys generated yet</h3>
            <p className="text-slate-400 max-w-xs mt-2">Generate a key to start querying flags from your application code.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-b transition-none hover:bg-transparent">
                <TableHead className="px-10 py-6 font-bold text-slate-400">LABEL</TableHead>
                <TableHead className="py-6 font-bold text-slate-400">ENVIRONMENT</TableHead>
                <TableHead className="py-6 font-bold text-slate-400">LAST USED</TableHead>
                <TableHead className="py-6 font-bold text-slate-400">CREATED</TableHead>
                <TableHead className="px-10 py-6 font-bold text-slate-400 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="group hover:bg-slate-50/20 transition-all border-b last:border-b-0">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                        <Shield size={16} />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{key.label}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className={`font-bold text-[10px] uppercase px-3 py-1 border-none shadow-sm ${
                      key.envName === 'production' ? 'bg-red-50 text-red-600' :
                      key.envName === 'staging' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {key.envName}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-slate-300" />
                      {key.lastUsed ? formatDistanceToNow(new Date(key.lastUsed), { addSuffix: true }) : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(key.createdAt!).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-10 py-6 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/30">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Need help integrating?</h3>
          <p className="opacity-80 text-sm">Check our comprehensive documentation for Node.js, React, and Go SDKs.</p>
        </div>
        <Button className="bg-white text-indigo-600 hover:bg-white/90 rounded-full px-8 h-12 font-bold shadow-lg">
          View Docs
        </Button>
      </div>
    </div>
  )
}

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            API Keys
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-bold">
            Authenticate your server-side and client-side SDKs with these secure environment-specific keys.
          </p>
        </div>
        <GenerateKeyDialog />
      </div>

      <div className="bg-[#111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[400px]">
        {keys.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
              <Key className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">No keys generated yet</h3>
            <p className="text-slate-500 max-w-xs mt-3 font-bold">Generate a key to start querying flags from your application code.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-b border-white/5 transition-none hover:bg-transparent">
                <TableHead className="px-10 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Label</TableHead>
                <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Environment</TableHead>
                <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Last Used</TableHead>
                <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Created</TableHead>
                <TableHead className="px-10 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="group hover:bg-white/[0.01] transition-all border-b border-white/5 last:border-b-0">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Shield size={18} />
                      </div>
                      <p className="font-black text-white text-lg tracking-tight">{key.label}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-8">
                    <Badge variant="outline" className={`font-black text-[10px] uppercase px-4 py-1.5 border-none shadow-sm tracking-[0.2em] ${
                      key.envName === 'production' ? 'bg-red-500/10 text-red-400' :
                      key.envName === 'staging' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {key.envName}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} className="text-slate-600" />
                      {key.lastUsed ? formatDistanceToNow(new Date(key.lastUsed), { addSuffix: true }) : 'Never used'}
                    </div>
                  </TableCell>
                  <TableCell className="py-8">
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(key.createdAt!).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-10 py-8 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400 h-10 w-10 text-slate-600">
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Integration Guide Section */}
      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <h3 className="text-2xl font-black text-white tracking-tight">How to use your API Keys</h3>
          <p className="text-slate-500 mt-1 font-bold">Use these keys to evaluate feature flags in your applications.</p>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">The Evaluation API</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Send a POST request to <code className="bg-white/5 px-2 py-1 rounded text-emerald-400">/api/evaluate</code> with your API key in the <code className="bg-white/5 px-2 py-1 rounded text-emerald-400">x-api-key</code> header.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto">
              <p className="text-emerald-500 mb-2">// cURL Example</p>
              <p>curl -X POST /api/evaluate \</p>
              <p>  -H "x-api-key: YOUR_KEY" \</p>
              <p>  -d &#123; "keys": ["flag-key"], "context": &#123; "userId": "123" &#125; &#125;</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Security Note</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Keys are environment-scoped. Production keys only evaluate production flag states. Never expose your keys in client-side code if you want to keep your flag definitions private.
              </p>
            </div>
            <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl border border-white/10">
              View SDK Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flag, ArrowRight, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface FlagTableProps {
  flags: any[]
}

export function FlagTable({ flags }: FlagTableProps) {
  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#111] rounded-[2.5rem] border border-white/5 transition-all hover:border-emerald-500/20 group shadow-2xl">
        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-emerald-500/5">
          <Flag className="w-12 h-12 text-emerald-500" />
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight">No flags yet</h3>
        <p className="text-slate-500 text-center max-w-sm mt-4 mb-10 leading-relaxed font-bold">
          Create your first feature flag to start managing your application behavior in real-time.
        </p>
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BOOLEAN':
        return <Badge className="bg-emerald-500 text-black border-none shadow-sm font-black text-[10px] tracking-widest px-3 py-1">BOOLEAN</Badge>
      case 'STRING':
        return <Badge className="bg-blue-500 text-white border-none shadow-sm font-black text-[10px] tracking-widest px-3 py-1">STRING</Badge>
      case 'NUMBER':
        return <Badge className="bg-amber-500 text-black border-none shadow-sm font-black text-[10px] tracking-widest px-3 py-1">NUMBER</Badge>
      case 'JSON':
        return <Badge className="bg-purple-500 text-white border-none shadow-sm font-black text-[10px] tracking-widest px-3 py-1">JSON</Badge>
      default:
        return <Badge variant="outline" className="text-white border-white/20">{type}</Badge>
    }
  }

  const StatusDot = ({ enabled }: { enabled: boolean }) => (
    <div className={`h-2.5 w-2.5 rounded-full border-2 border-[#111] shadow-sm ${enabled ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-white/10'}`} />
  )

  return (
    <div className="bg-[#111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-b border-white/5 transition-none hover:bg-transparent">
            <TableHead className="px-10 font-black text-slate-500 uppercase tracking-widest text-[10px] py-6">Key</TableHead>
            <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Type</TableHead>
            <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">Environments</TableHead>
            <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-center">Rules</TableHead>
            <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Updated</TableHead>
            <TableHead className="px-10 text-right py-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags.map((flag) => (
            <TableRow key={flag.id} className="group hover:bg-white/[0.01] transition-all border-b border-white/5 last:border-b-0">
              <TableCell className="px-10 py-8">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono font-black text-lg text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                    {flag.key}
                  </span>
                  <span className="text-xs text-slate-500 font-bold line-clamp-1">{flag.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-8">
                {getTypeBadge(flag.type)}
              </TableCell>
              <TableCell className="py-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                    <StatusDot enabled={true} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Prod</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                    <StatusDot enabled={false} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stag</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                    <StatusDot enabled={false} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dev</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-8 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-400 font-black text-[10px] border border-white/5">
                  <ShieldCheck size={14} className="text-emerald-500/50" />
                  {flag._count?.rules || 0}
                </div>
              </TableCell>
              <TableCell className="py-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Clock size={14} className="text-slate-700" />
                  {formatDistanceToNow(new Date(flag.updatedAt || flag.createdAt), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="px-10 py-8 text-right">
                <Button size="icon" variant="ghost" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/10 text-emerald-500" asChild>
                  <Link href={`/dashboard/flags/${flag.key}`}>
                    <ArrowRight size={20} />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


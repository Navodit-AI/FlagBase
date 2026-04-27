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
      <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-900 group">
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
          <Flag className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No flags yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mt-3 mb-8 leading-relaxed">
          Create your first feature flag to start managing your application behavior in real-time.
        </p>
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BOOLEAN':
        return <Badge className="bg-emerald-500 text-white border-none shadow-sm">BOOLEAN</Badge>
      case 'STRING':
        return <Badge className="bg-indigo-500 text-white border-none shadow-sm">STRING</Badge>
      case 'NUMBER':
        return <Badge className="bg-amber-500 text-white border-none shadow-sm">NUMBER</Badge>
      case 'JSON':
        return <Badge className="bg-purple-500 text-white border-none shadow-sm">JSON</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const StatusDot = ({ enabled }: { enabled: boolean }) => (
    <div className={`h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${enabled ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700'}`} />
  )

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
          <TableRow className="border-b transition-none hover:bg-transparent">
            <TableHead className="px-8 font-bold text-slate-400 py-5">KEY</TableHead>
            <TableHead className="py-5 font-bold text-slate-400">TYPE</TableHead>
            <TableHead className="py-5 font-bold text-slate-400 text-center">ENVIRONMENTS</TableHead>
            <TableHead className="py-5 font-bold text-slate-400 text-center">RULES</TableHead>
            <TableHead className="py-5 font-bold text-slate-400">UPDATED</TableHead>
            <TableHead className="px-8 text-right py-5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags.map((flag) => (
            <TableRow key={flag.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all border-b last:border-b-0">
              <TableCell className="px-8 py-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {flag.key}
                  </span>
                  <span className="text-xs text-slate-400 line-clamp-1">{flag.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-6">
                {getTypeBadge(flag.type)}
              </TableCell>
              <TableCell className="py-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <StatusDot enabled={true} />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Prod</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <StatusDot enabled={false} />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Stag</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <StatusDot enabled={false} />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Dev</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">
                  <ShieldCheck size={12} className="text-slate-400" />
                  {flag._count?.rules || 0}
                </div>
              </TableCell>
              <TableCell className="py-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} className="text-slate-300" />
                  {formatDistanceToNow(new Date(flag.updatedAt || flag.createdAt), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                <Button size="icon" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600" asChild>
                  <Link href={`/dashboard/flags/${flag.key}`}>
                    <ArrowRight size={18} />
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

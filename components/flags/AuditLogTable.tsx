'use client'

import { useState, useEffect } from 'react'
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
import { Clock, User, ChevronLeft, ChevronRight, History } from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
  id: string
  action: string
  actorEmail: string
  createdAt: string
  diff: any
}

export function AuditLogTable({ flagKey }: { flagKey: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/flags/${flagKey}/audit?page=${page}&limit=10`)
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [flagKey, page])

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'FLAG_CREATED':
        return <Badge className="bg-sky-500 text-white border-none">CREATED</Badge>
      case 'FLAG_UPDATED':
        return <Badge className="bg-amber-500 text-white border-none">UPDATED</Badge>
      case 'OVERRIDE_TOGGLED':
        return <Badge className="bg-emerald-500 text-white border-none">TOGGLED</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="py-20 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
        <History className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No audit logs found.</p>
        <p className="text-xs text-slate-400 mt-1">Every change to this flag will be recorded here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="border-b transition-none hover:bg-transparent">
              <TableHead className="px-8 font-bold text-slate-400 py-5">TIMESTAMP</TableHead>
              <TableHead className="py-5 font-bold text-slate-400">ACTION</TableHead>
              <TableHead className="py-5 font-bold text-slate-400">ACTOR</TableHead>
              <TableHead className="px-8 py-5 font-bold text-slate-400">CHANGES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-b last:border-b-0 hover:bg-slate-50/20 transition-colors">
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Clock size={14} className="text-slate-400" />
                    {format(new Date(log.createdAt), "MMM d, yyyy 'at' HH:mm")}
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  {getActionBadge(log.action)}
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <User size={12} />
                    </div>
                    {log.actorEmail}
                  </div>
                </TableCell>
                <TableCell className="px-8 py-5">
                  {log.diff ? (
                    <div className="text-[10px] font-mono p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 max-w-sm truncate whitespace-pre group cursor-help">
                      <span className="text-red-500">-{JSON.stringify(log.diff.before)}</span>
                      <br />
                      <span className="text-emerald-500">+{JSON.stringify(log.diff.after)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Initial Creation</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Page {page}</p>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="rounded-xl h-10 px-4 font-bold text-slate-500"
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < 10}
            className="rounded-xl h-10 px-4 font-bold text-slate-500"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

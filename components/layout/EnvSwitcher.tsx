'use client'

import { useEnvironment, Env } from '@/lib/env-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function EnvSwitcher() {
  const { env, setEnv } = useEnvironment()

  const getBadge = (currentEnv: Env) => {
    switch (currentEnv) {
      case 'production':
        return <Badge className="bg-red-500 text-black border-none shadow-sm ml-2 font-black text-[9px] px-2 py-0.5 tracking-widest">LIVE</Badge>
      case 'staging':
        return <Badge className="bg-amber-500 text-black border-none shadow-sm ml-2 font-black text-[9px] px-2 py-0.5 tracking-widest">STAGING</Badge>
      case 'development':
        return <Badge className="bg-emerald-500 text-black border-none shadow-sm ml-2 font-black text-[9px] px-2 py-0.5 tracking-widest">DEV</Badge>
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={env} onValueChange={(value) => setEnv(value as Env)}>
        <SelectTrigger className="w-[200px] bg-white/5 border-white/10 rounded-xl focus:ring-emerald-500/20 text-white font-black text-[10px] uppercase tracking-widest h-10">
          <div className="flex items-center justify-between w-full pr-2">
            <SelectValue placeholder="Environment" />
            {getBadge(env)}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl">
          <SelectItem value="production" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Production</SelectItem>
          <SelectItem value="staging" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Staging</SelectItem>
          <SelectItem value="development" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Development</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


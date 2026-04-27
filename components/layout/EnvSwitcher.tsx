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
        return <Badge className="bg-red-500 hover:bg-red-500 text-white border-none shadow-sm ml-2">LIVE</Badge>
      case 'staging':
        return <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-none shadow-sm ml-2">STAGING</Badge>
      case 'development':
        return <Badge className="bg-slate-500 hover:bg-slate-500 text-white border-none shadow-sm ml-2">DEV</Badge>
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={env} onValueChange={(value) => setEnv(value as Env)}>
        <SelectTrigger className="w-[180px] bg-background/50 border-border/50 rounded-xl focus:ring-primary/20">
          <div className="flex items-center justify-between w-full pr-2">
            <SelectValue placeholder="Environment" />
            {getBadge(env)}
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/50 shadow-2xl">
          <SelectItem value="production" className="rounded-lg">Production</SelectItem>
          <SelectItem value="staging" className="rounded-lg">Staging</SelectItem>
          <SelectItem value="development" className="rounded-lg">Development</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

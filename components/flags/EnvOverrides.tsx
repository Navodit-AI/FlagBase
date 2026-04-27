'use client'

import { useState } from 'react'
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface Override {
  id: string
  enabled: boolean
  value: string | null
  envId: string
  env: {
    id: string
    name: string
  }
}

interface EnvOverridesProps {
  flagId: string
  flagKey: string
  flagType: string
  initialOverrides: Override[]
  availableEnvs: { id: string, name: string }[]
}

export function EnvOverrides({ flagId, flagKey, flagType, initialOverrides, availableEnvs }: EnvOverridesProps) {
  const [overrides, setOverrides] = useState(initialOverrides)
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const handleToggle = async (envName: string, envId: string, currentEnabled: boolean) => {
    // 1. Optimistic Update
    const previous = [...overrides]
    setOverrides(prev => {
      const existing = prev.find(o => o.envId === envId)
      if (existing) {
        return prev.map(o => o.envId === envId ? { ...o, enabled: !currentEnabled } : o)
      }
      return [...prev, { id: 'temp', enabled: !currentEnabled, value: null, envId, env: { id: envId, name: envName } }]
    })

    try {
      const res = await fetch(`/api/flags/${flagKey}/envs/${envName}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !currentEnabled }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success(`${envName} environment ${!currentEnabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setOverrides(previous)
      toast.error(`Failed to update ${envName}`)
    }
  }

  const handleValueUpdate = async (envName: string, envId: string, newValue: string) => {
    setLoadingMap(prev => ({ ...prev, [envId]: true }))
    try {
      const res = await fetch(`/api/flags/${flagKey}/envs/${envName}`, {
        method: 'PATCH',
        body: JSON.stringify({ value: newValue }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) throw new Error('Failed to update')
      
      setOverrides(prev => prev.map(o => o.envId === envId ? { ...o, value: newValue } : o))
      toast.success(`${envName} value updated`)
    } catch (err) {
      toast.error(`Failed to update ${envName} value`)
    } finally {
      setLoadingMap(prev => ({ ...prev, [envId]: false }))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {availableEnvs.map((env) => {
        const override = overrides.find(o => o.envId === env.id) || { enabled: false, value: null }
        const isLoading = loadingMap[env.id]

        return (
          <div key={env.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white capitalize">{env.name}</span>
                <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-slate-200 dark:border-slate-800">ENV</Badge>
              </div>
              <Switch 
                checked={override.enabled} 
                onCheckedChange={() => handleToggle(env.name, env.id, override.enabled)}
              />
            </div>

            <div className="space-y-4">
              {flagType !== 'BOOLEAN' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Environment Value</label>
                  <div className="relative">
                    <Input 
                      placeholder="Enter value..." 
                      defaultValue={override.value || ''}
                      onBlur={(e) => handleValueUpdate(env.name, env.id, e.target.value)}
                      className="rounded-xl border-none bg-slate-50 dark:bg-slate-800 h-11 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Save className="w-4 h-4 text-slate-200" />}
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex items-center gap-2 text-xs font-bold ${override.enabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${override.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`} />
                {override.enabled ? 'Actively Serving' : 'Serving Default'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

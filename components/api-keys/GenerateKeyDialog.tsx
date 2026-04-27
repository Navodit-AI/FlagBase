'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus, Copy, Check, AlertTriangle, Key } from "lucide-react"
import { toast } from "sonner"

export function GenerateKeyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [env, setEnv] = useState('production')
  const router = useRouter()

  const handleGenerate = async () => {
    if (!label) return toast.error("Please provide a label")
    setLoading(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, envName: env })
      })
      if (!res.ok) throw new Error("Failed to generate key")
      const data = await res.json()
      setGeneratedKey(data.apiKey)
      toast.success("API Key generated")
    } catch (err) {
      toast.error("Generation failed")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      toast.success("Copied to clipboard")
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (generatedKey) {
      setGeneratedKey(null)
      setLabel('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 h-12">
          <Plus className="w-5 h-5 mr-2" />
          Generate New Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 shadow-2xl p-8 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">Generate API Key</DialogTitle>
          <DialogDescription className="text-slate-500">
            Create a secure key to access FlagBase from your application.
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Key Label</label>
              <Input 
                placeholder="e.g. Next.js Main App" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="rounded-xl border-none bg-slate-50 dark:bg-slate-900 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Environment</label>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="rounded-xl border-none bg-slate-50 dark:bg-slate-900 h-12 outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all">
              {loading ? "Generating..." : "Generate Secret Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex gap-4">
              <AlertTriangle className="text-amber-600 w-6 h-6 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Save this key now!</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 leading-relaxed italic">
                  For your security, we only show this key once. If you lose it, you'll need to generate a new one.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-2 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <Key size={20} />
                </div>
                <Input 
                  readOnly 
                  value={generatedKey}
                  className="border-none bg-transparent font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm focus-visible:ring-0" 
                />
                <Button onClick={copyToClipboard} size="icon" className="rounded-xl h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold">
              I've saved it, close window
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

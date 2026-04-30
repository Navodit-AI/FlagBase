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
        <Button className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 h-12 font-black uppercase tracking-widest text-[10px]">
          <Plus className="w-4 h-4 mr-2" />
          Generate New Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-white/5 shadow-2xl p-8 bg-[#111] text-white">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter">Generate API Key</DialogTitle>
          <DialogDescription className="text-slate-500 font-bold">
            Create a secure key to access FlagBase from your application.
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Key Label</label>
              <Input 
                placeholder="e.g. Next.js Main App" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="rounded-xl border-white/5 bg-white/5 h-12 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Environment</label>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="rounded-xl border-white/5 bg-white/5 h-12 outline-none focus:border-emerald-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-xl shadow-emerald-500/20 transition-all">
              {loading ? "Generating..." : "Generate Secret Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4">
              <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-black text-amber-500">Save this key now!</p>
                <p className="text-xs text-amber-200/50 leading-relaxed italic font-bold">
                  For your security, we only show this key once. If you lose it, you'll need to generate a new one.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-black border border-white/10 rounded-2xl p-2 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                  <Key size={20} />
                </div>
                <Input 
                  readOnly 
                  value={generatedKey}
                  className="border-none bg-transparent font-mono font-black text-emerald-400 text-sm focus-visible:ring-0" 
                />
                <Button onClick={copyToClipboard} size="icon" className="rounded-xl h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-black shadow-md">
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full h-12 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px]">
              I've saved it, close window
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}

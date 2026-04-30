'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { UserPlus, Mail, Shield, Loader2 } from "lucide-react"

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    setOpen(false)
    alert("Invite sent successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 h-12 font-black">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Teammate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#111] border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Invite Teammate</DialogTitle>
          <DialogDescription className="text-slate-400">
            Send an invitation to join your workspace. They will receive an email to sign up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                id="email" 
                placeholder="colleague@company.com" 
                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-12"
                required
                type="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-slate-500">Access Role</Label>
            <Select defaultValue="VIEWER">
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl h-12">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <SelectValue placeholder="Select a role" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black h-12 rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

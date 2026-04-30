'use client'

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, Check, X } from "lucide-react"

const roles = [
  {
    name: 'Owner',
    desc: 'Full access to everything including billing and deletion.',
    perms: { flags: true, keys: true, members: true, billing: true }
  },
  {
    name: 'Admin',
    desc: 'Can manage flags, keys, and members but cannot delete workspace.',
    perms: { flags: true, keys: true, members: true, billing: false }
  },
  {
    name: 'Editor',
    desc: 'Can create and modify flags but cannot manage team or keys.',
    perms: { flags: true, keys: false, members: false, billing: false }
  },
  {
    name: 'Viewer',
    desc: 'Read-only access to flags and environments.',
    perms: { flags: false, keys: false, members: false, billing: false }
  }
]

export function RolePoliciesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-auto rounded-full font-black text-emerald-500 hover:bg-emerald-500/10 transition-colors">
          Review Policies
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Role Permissions</DialogTitle>
          <DialogDescription className="text-slate-400">
            Understand what each role can do within your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {roles.map((role) => (
              <div key={role.name} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="font-black text-white">{role.name}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{role.desc}</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Perm label="Manage Flags" active={role.perms.flags} />
                  <Perm label="Manage Keys" active={role.perms.keys} />
                  <Perm label="Manage Team" active={role.perms.members} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Perm({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-slate-600'}`}>
      {active ? <Check size={12} /> : <X size={12} />}
      {label}
    </div>
  )
}

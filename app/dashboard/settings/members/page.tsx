import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, members as membersTable, users as usersTable } from "@/lib/db"
import { eq } from "drizzle-orm"
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { InviteMemberDialog } from "@/components/members/InviteMemberDialog"
import { RolePoliciesDialog } from "@/components/members/RolePoliciesDialog"

export default async function MembersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const orgId = (session?.user as any)?.orgId
  const userRole = (session?.user as any)?.role

  // Fetch members with user data via Drizzle join
  const members = await db.select({
    id: membersTable.id,
    role: membersTable.role,
    name: usersTable.name,
    email: usersTable.email,
  })
  .from(membersTable)
  .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
  .where(eq(membersTable.orgId, orgId))

  const canManage = userRole === 'ADMIN' || userRole === 'OWNER'

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Workspace Members
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-bold">
            Manage your team's access and define their roles within this workspace.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="bg-[#111] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-b border-white/5 transition-none hover:bg-transparent">
              <TableHead className="px-10 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Team Member</TableHead>
              <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Email Address</TableHead>
              <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Access Role</TableHead>
              <TableHead className="px-10 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="group hover:bg-white/[0.01] transition-all border-b border-white/5 last:border-b-0">
                <TableCell className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20 text-lg">
                      {member.name?.[0].toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tight">{member.name || 'Pending Invite'}</p>
                      <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-[0.2em] mt-0.5">Joined workspace</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-8">
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                    <Mail size={14} className="text-slate-600" />
                    {member.email}
                  </div>
                </TableCell>
                <TableCell className="py-8">
                  {canManage && member.role !== 'OWNER' ? (
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-[140px] rounded-xl border border-white/10 bg-white/5 h-10 font-black text-[10px] uppercase tracking-widest text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={`font-black text-[10px] tracking-[0.2em] px-4 py-1.5 border-none shadow-sm uppercase ${
                      member.role === 'OWNER' ? 'bg-emerald-500 text-black' :
                      member.role === 'ADMIN' ? 'bg-white/10 text-white' :
                      'bg-white/5 text-slate-500'
                    }`}>
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-10 py-8 text-right">
                  {member.role !== 'OWNER' && (
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/5 h-10 w-10 text-slate-400">
                        <MoreVertical size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400 h-10 w-10 text-slate-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-[#111] border border-white/5 rounded-[2.5rem] p-10 flex items-center gap-8 group hover:border-emerald-500/20 transition-all shadow-xl">
          <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform border border-emerald-500/20">
            <Shield size={28} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-xl text-white tracking-tight">Role Permissions</h4>
            <p className="text-slate-500 mt-1 font-bold">Learn more about what Admins, Editors, and Viewers can manage.</p>
          </div>
          <RolePoliciesDialog />
        </div>
      </div>
    </div>
  )
}


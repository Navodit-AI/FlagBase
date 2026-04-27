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
import { UserPlus, Shield, Mail, MoreVertical, Trash2 } from "lucide-react"

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Workspace Members
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage your team's access and define their roles within this workspace.
          </p>
        </div>
        <Button className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 h-12 font-bold">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Teammate
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="border-b transition-none hover:bg-transparent">
              <TableHead className="px-10 py-6 font-bold text-slate-400">TEAM MEMBER</TableHead>
              <TableHead className="py-6 font-bold text-slate-400">EMAIL ADDRESS</TableHead>
              <TableHead className="py-6 font-bold text-slate-400">ACCESS ROLE</TableHead>
              <TableHead className="px-10 py-6 font-bold text-slate-400 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="group hover:bg-slate-50/20 transition-all border-b last:border-b-0">
                <TableCell className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {member.name?.[0].toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{member.name || 'Pending Invite'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Joined workspace</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={14} className="text-slate-300" />
                    {member.email}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  {canManage && member.role !== 'OWNER' ? (
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-[140px] rounded-xl border-none bg-slate-50 dark:bg-slate-800 h-9 font-bold text-xs uppercase tracking-tight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={`font-bold text-[10px] tracking-[0.1em] px-3 py-1 border-none shadow-sm ${
                      member.role === 'OWNER' ? 'bg-indigo-600 text-white' :
                      member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-10 py-6 text-right">
                  {member.role !== 'OWNER' && (
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100 h-9 w-9">
                        <MoreVertical size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 h-9 w-9 text-slate-300">
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
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] p-8 flex items-center gap-6 group hover:border-indigo-200 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Role Permissions</h4>
            <p className="text-sm text-slate-500 mt-1">Learn more about what Admins, Editors, and Viewers can manage.</p>
          </div>
          <Button variant="ghost" className="ml-auto rounded-full font-bold text-indigo-600">Review Policies</Button>
        </div>
      </div>
    </div>
  )
}

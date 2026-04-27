import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flag, Key, Users, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnvSwitcher } from '@/components/layout/EnvSwitcher'
import { EnvironmentProvider } from '@/lib/env-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <EnvironmentProvider>
      <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r bg-white dark:bg-slate-900 flex flex-col h-full shadow-sm z-20 transition-all">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">FlagBase</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Management</p>
            <SidebarItem href="/dashboard/flags" icon={<Flag size={20} />} label="Flags" active />
            <SidebarItem href="/dashboard/settings/api-keys" icon={<Key size={20} />} label="API Keys" />
            <SidebarItem href="/dashboard/settings/members" icon={<Users size={20} />} label="Members" />
          </nav>

          <div className="p-6 border-t bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 px-2 py-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {session.user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
              </div>
            </div>
            
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <Button type="submit" variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl">
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main View Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Navigation */}
          <header className="h-20 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-10 z-10 sticky top-0">
            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Workspace</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 dark:text-white font-bold tracking-tight">Main Dashboard</span>
            </div>
            
            <div className="flex items-center gap-6">
              <EnvSwitcher />
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </EnvironmentProvider>
  )
}

function SidebarItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
        active 
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
      }`}
    >
      <span className={`${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`}>
        {icon}
      </span>
      {label}
    </Link>
  )
}

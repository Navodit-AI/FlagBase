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
      <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-slate-300">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-[#0a0a0a] flex flex-col h-full z-20 transition-all">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flag className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">FlagBase</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Management</p>
            <SidebarItem href="/dashboard/flags" icon={<Flag size={20} />} label="Flags" active />
            <SidebarItem href="/dashboard/settings/api-keys" icon={<Key size={20} />} label="API Keys" />
            <SidebarItem href="/dashboard/settings/members" icon={<Users size={20} />} label="Members" />
          </nav>

          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 px-2 py-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20">
                {session.user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{session.user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
              </div>
            </div>
            
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <Button type="submit" variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl">
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main View Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Navigation */}
          <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-10 z-10 sticky top-0">
            <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
              <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest text-[10px]">Workspace</span>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-white font-black tracking-tight">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-6">
              <EnvSwitcher />
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-10 bg-[#0a0a0a] custom-scrollbar">
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
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
          : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`}>
        {icon}
      </span>
      {label}
    </Link>
  )
}


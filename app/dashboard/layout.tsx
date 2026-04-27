import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Flag, 
  Layers, 
  Settings, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react'

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
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col h-full">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <Flag className="w-5 h-5 text-white dark:text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight">FlagBase</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
          <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <NavItem href="/dashboard/flags" icon={<Flag size={18} />} label="Feature Flags" active />
          <NavItem href="/dashboard/environments" icon={<Layers size={18} />} label="Environments" />
          
          <div className="pt-4">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
            <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50" asChild>
            <Link href="/api/auth/signout">
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Organization</span>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-900 dark:text-white">Main Org</span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline">Docs</Button>
            <Button size="sm">New Flag</Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

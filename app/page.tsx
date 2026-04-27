import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Flag, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <Flag className="w-5 h-5 text-white dark:text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight">FlagBase</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 mb-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          Now in Beta for Next.js 16
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Feature Management <br />
          <span className="text-slate-500">Without the Complexity.</span>
        </h1>
        
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
          The open-source feature flag platform for high-velocity teams. 
          Deploy code with confidence, roll out features gradually, and ship faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl" asChild>
            <Link href="/register">
              Start Building Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl">
            View Documentation
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            title="Instant Rollouts"
            description="Toggle features globally in milliseconds with our edge-ready architecture."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-blue-500" />}
            title="Safe Deployment"
            description="Reduce risk with percentage-based rollouts and instant kill switches."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-green-500" />}
            title="Detailed Insights"
            description="Track feature adoption and impact with real-time audit logs and analytics."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-slate-500 text-sm">
        <p>© 2026 FlagBase SaaS Platform. Built for developers by developers.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Terminal, 
  Flag, 
  Zap, 
  Users, 
  Layers, 
  ChevronRight, 
  ExternalLink,
  Menu, 
  X,
  Target,
  ArrowRight
} from "lucide-react"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <span className="text-lg">🚩</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">FlagBase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link>
            <Link href="https://github.com/Navodit-AI/FlagBase" className="hover:text-emerald-400 transition-colors">Open Source</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-bold text-white hover:bg-white/5">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 px-6 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-6 space-y-6 flex flex-col md:hidden animate-in slide-in-from-top-4 duration-300">
            <Link href="#features" className="text-lg font-bold text-slate-400" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="text-lg font-bold text-slate-400" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
              <Link href="/login">
                <Button variant="ghost" className="w-full text-white justify-start">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold">Get Started Free</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Open Source • Free Forever • Self Hostable
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white mb-8">
            Ship code.<br />
            <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">Control the rollout.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            FlagBase is a self-hosted feature flag manager for developers. 
            Manage targeting, run rollouts, and kill switches without the enterprise tax.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-black h-14 px-10 rounded-full text-lg shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                Get Started Free <ChevronRight size={20} />
              </Button>
            </Link>
            <Link href="https://github.com/Navodit-AI/FlagBase" target="_blank">
              <Button variant="outline" className="h-14 px-10 rounded-full border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2">
                <ExternalLink size={20} /> View on GitHub
              </Button>
            </Link>
          </div>

          <div className="text-sm font-bold text-slate-600 mb-20">
            Free forever • No credit card • Deploy in 5 minutes
          </div>

          {/* Hero Visual: Terminal */}
          <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center gap-1.5 px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <span className="ml-4 text-xs font-mono text-slate-500">evaluate.http</span>
            </div>
            <div className="p-8 text-left font-mono text-sm leading-relaxed overflow-x-auto">
              <pre className="text-slate-300">
                <span className="text-emerald-400">POST</span> /api/evaluate{'\n'}
                <span className="text-emerald-600">x-api-key:</span> fb_abc123...{'\n\n'}
                {'{'}{'\n'}
                <span className="text-emerald-500">  "keys":</span> [<span className="text-amber-300">"warp-speed-mode"</span>, <span className="text-amber-300">"stargate-api"</span>],{'\n'}
                <span className="text-emerald-500">  "context":</span> {'{'}{'\n'}
                <span className="text-emerald-500">    "userId":</span> <span className="text-amber-300">"pilot_42"</span>,{'\n'}
                <span className="text-emerald-500">    "email":</span> <span className="text-amber-300">"solo@falcon.mil"</span>{'\n'}
                {'  }'}{'\n'}
                {'}'}
              </pre>
              <div className="mt-6 pt-6 border-t border-white/5 italic text-slate-600">
                // Response
              </div>
              <pre className="text-emerald-400 mt-2">
                {'{'}{'\n'}
                {'  "warp-speed-mode": '} <span className="text-white font-bold">true</span>,{'\n'}
                {'  "stargate-api": '} <span className="text-white/40">false</span>{'\n'}
                {'}'}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-black text-white">100% Free</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Self-hosted forever</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black text-white">1 API Call</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Evaluate N flags at once</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black text-white">∞ Flags</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No limits on your ambition</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Everything your team needs</h2>
            <p className="text-xl text-slate-400">Built for engineers who ship fast</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Cards */}
            {[
              { icon: '🚩', title: 'Feature Flags', desc: 'Create boolean, string, number, or JSON flags. Toggle them per environment instantly.' },
              { icon: '🎯', title: 'Audience Targeting', desc: 'Target users by email, plan, region, or any custom attribute with flexible condition rules.' },
              { icon: '📊', title: 'Percentage Rollouts', desc: 'Gradually roll out to 5%, 20%, 100% of users. Deterministic bucketing keeps experience consistent.' },
              { icon: '🔐', title: 'Role-Based Access', desc: 'OWNER, ADMIN, EDITOR, VIEWER roles. Control who can change what.' },
              { icon: '📋', title: 'Audit Logs', desc: 'Every flag change is recorded with a before/after diff. Know who changed what and when.' },
              { icon: '🔑', title: 'API Keys', desc: 'Scoped API keys per environment. Call /api/evaluate from any app in any language.' },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#111] border border-white/5 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl mb-8 shadow-xl shadow-emerald-500/20">1</div>
              <h3 className="text-xl font-bold text-white mb-4">Create your flags</h3>
              <p className="text-slate-400 leading-relaxed">Define flags with targeting rules and environment overrides in the dashboard.</p>
              <div className="hidden md:block absolute top-6 left-24 w-1/2 border-t-2 border-dashed border-white/10" />
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl mb-8 shadow-xl shadow-emerald-500/20">2</div>
              <h3 className="text-xl font-bold text-white mb-4">Generate an API key</h3>
              <p className="text-slate-400 leading-relaxed">Scope a key to your environment — production, staging, or development.</p>
              <div className="hidden md:block absolute top-6 left-24 w-1/2 border-t-2 border-dashed border-white/10" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl mb-8 shadow-xl shadow-emerald-500/20">3</div>
              <h3 className="text-xl font-bold text-white mb-4">Evaluate in your app</h3>
              <p className="text-slate-400 leading-relaxed">Call /api/evaluate with your user context. Get typed values back instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl rounded-[3rem] bg-emerald-500 p-12 md:p-24 text-center text-black relative overflow-hidden shadow-2xl shadow-emerald-500/40">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Flag size={200} />
          </div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">Start shipping safer today</h2>
            <p className="text-xl font-bold opacity-80 mb-10">Free forever. High-performance feature flags.</p>
            <Link href="/register">
              <Button size="lg" className="bg-black text-white hover:bg-slate-900 font-black h-16 px-12 rounded-full text-xl transition-all hover:scale-105 shadow-2xl">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <span className="text-sm">🚩</span>
                </div>
                <span className="text-lg font-black tracking-tight text-white">FlagBase</span>
              </div>
              <p className="text-sm font-bold text-slate-500 tracking-tight">Open source feature flags for modern teams.</p>
            </div>

            <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <Link href="https://github.com/Navodit-AI/FlagBase" className="hover:text-emerald-400 transition-colors">GitHub</Link>
              <Link href="/dashboard/flags" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-xs font-bold text-slate-600 uppercase tracking-widest">
            <div>Built with Next.js, Drizzle, and Neon • MIT License</div>
            <div>&copy; {new Date().getFullYear()} FlagBase Authors.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

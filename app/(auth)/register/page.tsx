'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Loader2, Mail, Lock, User, Building, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    orgName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/login?message=Account created successfully. Please login.')
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center p-4">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-15 blur-[120px] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-15 blur-[120px] animate-float"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', animationDelay: '-5s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-700">
        <div className="glass-effect rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Get Started</h1>
            <p className="text-zinc-400 text-center text-sm font-medium">
              Join the future of feature management
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Work Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Company
              </Label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="orgName"
                  placeholder="Acme Inc."
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="md:col-span-2 w-full h-14 mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] group active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold underline-offset-8 hover:underline transition-all">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

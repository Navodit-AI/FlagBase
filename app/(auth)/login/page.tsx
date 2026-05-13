'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Loader2, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
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
        
        {/* Animated Glow Orbs with Radial Gradients for maximum compatibility */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px] animate-float"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', animationDelay: '-5s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="glass-effect rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <Shield className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Welcome</h1>
            <p className="text-zinc-400 text-center text-sm font-medium">
              Access your FlagBase command center
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 text-center animate-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Password
                </Label>
                <Link href="#" className="text-xs text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 text-white focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-2xl text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 mt-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] group active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-500 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-bold underline-offset-8 hover:underline transition-all">
                Join the beta
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em]">
          &copy; 2024 FlagBase &bull; Security First Evaluation
        </div>
      </div>
    </div>
  )
}

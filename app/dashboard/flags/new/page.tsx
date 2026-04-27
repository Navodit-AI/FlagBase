import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function NewFlagPage() {
  const session = await auth()
  const orgId = session?.user?.orgId

  async function createFlag(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const key = formData.get('key') as string
    const description = formData.get('description') as string

    if (!name || !key || !orgId) return

    // Create flag and default environment settings
    const environments = await prisma.environment.findMany({
      where: { orgId }
    })

    await prisma.flag.create({
      data: {
        name,
        key: key.toLowerCase().trim().replace(/\s+/g, '-'),
        description,
        orgId,
        defaultValue: 'false',
        overrides: {
          create: environments.map(env => ({
            envId: env.id,
            enabled: false,
            value: 'false'
          }))
        }
      }
    })

    redirect('/dashboard/flags')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-500">
        <Link href="/dashboard/flags">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to flags
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Feature Flag</CardTitle>
          <CardDescription>
            Define a new flag to control feature visibility across your environments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFlag} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. New User Dashboard" 
                required 
              />
              <p className="text-xs text-slate-500">A human-readable name for your flag.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Flag Key</Label>
              <Input 
                id="key" 
                name="key" 
                placeholder="e.g. new-dashboard-v2" 
                required 
              />
              <p className="text-xs text-slate-500">This key will be used in your code to reference this flag.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Briefly explain what this flag controls..." 
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/flags">Cancel</Link>
              </Button>
              <Button type="submit">Create Flag</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

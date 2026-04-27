import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'

export default async function FlagDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const orgId = session?.user?.orgId

  const flag = await prisma.flag.findUnique({
    where: { id: params.id, orgId },
    include: {
      overrides: {
        include: {
          env: true
        }
      }
    }
  })

  if (!flag) notFound()

  async function updateFlagSettings(formData: FormData) {
    'use server'
    const flagId = params.id
    
    // Get all overrides for this flag
    const currentOverrides = await prisma.flagOverride.findMany({
      where: { flagId }
    })

    // Update each override based on form data
    await Promise.all(
      currentOverrides.map(async (override) => {
        const isEnabled = formData.get(`env-${override.envId}`) === 'on'
        return prisma.flagOverride.update({
          where: { id: override.id },
          data: { enabled: isEnabled }
        })
      })
    )

    revalidatePath(`/dashboard/flags/${flagId}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-500">
          <Link href="/dashboard/flags">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to flags
          </Link>
        </Button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{flag.name}</h1>
          <code className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded mt-2 inline-block">
            {flag.key}
          </code>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100">
            Archive Flag
          </Button>
        </div>
      </div>

      <form action={updateFlagSettings} className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Toggles</CardTitle>
              <CardDescription>
                Control the state of this flag across your organization's environments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {flag.overrides.map((override) => (
                <div key={override.id} className="flex items-center justify-between pb-6 border-b last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Label htmlFor={`env-${override.envId}`} className="text-base font-semibold capitalize">
                      {override.env.name}
                    </Label>
                    <p className="text-sm text-slate-500">
                      Currently {override.enabled ? 'Enabled' : 'Disabled'} in {override.env.name}.
                    </p>
                  </div>
                  <Switch 
                    id={`env-${override.envId}`} 
                    name={`env-${override.envId}`}
                    defaultChecked={override.enabled}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-yellow-100 bg-yellow-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-600" />
                Unsaved Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                You have might have modified toggles. Be sure to save your changes to apply them.
              </p>
              <Button type="submit" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  key: z.string().regex(/^[a-z0-9_-]+$/, "Key must count only lowercase letters, numbers, hyphens, and underscores"),
  description: z.string().optional(),
  type: z.enum(["BOOLEAN", "STRING", "NUMBER", "JSON"]),
  defaultValue: z.string().min(1, "Default value is required"),
})

export function NewFlagDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
      type: "BOOLEAN",
      defaultValue: "false",
    },
  })

  // Update default value placeholder/type when type changes
  const flagType = form.watch("type")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create flag')
      }

      toast.success("Flag created successfully")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 h-12 font-black uppercase tracking-widest text-[10px]">
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-white/5 shadow-2xl p-8 bg-[#111] text-white">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter">Create New Flag</DialogTitle>
          <DialogDescription className="text-slate-500 font-bold">
            Define a new feature flag and its default value.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Quantum Stabilizer" {...field} className="rounded-xl bg-white/5 border-white/5 h-12 focus:border-emerald-500/50" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Flag Key</FormLabel>
                    <FormControl>
                      <Input placeholder="stabilize-flux-cap" {...field} className="rounded-xl bg-white/5 border-white/5 h-12 font-mono text-sm focus:border-emerald-500/50" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain what happens when this flag is enabled..." {...field} className="rounded-xl bg-white/5 border-white/5 min-h-[100px] focus:border-emerald-500/50" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6 items-end">
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Flag Type</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val)
                      form.setValue("defaultValue", val === "BOOLEAN" ? "false" : "")
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-white/5 border-white/5 h-12 focus:border-emerald-500/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                        <SelectItem value="BOOLEAN">Boolean</SelectItem>
                        <SelectItem value="STRING">String</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                      Default Value
                    </FormLabel>
                    <FormControl>
                      {flagType === "BOOLEAN" ? (
                        <div className="flex items-center h-12 px-4 bg-white/5 border border-white/5 rounded-xl justify-between">
                          <span className="text-[10px] font-black font-mono uppercase text-emerald-500">{field.value}</span>
                          <Switch 
                            checked={field.value === "true"} 
                            onCheckedChange={(checked) => field.onChange(checked.toString())} 
                          />
                        </div>
                      ) : (
                        <Input 
                          placeholder={flagType === "NUMBER" ? "0" : flagType === "JSON" ? "{}" : "value..."} 
                          type={flagType === "NUMBER" ? "number" : "text"}
                          {...field} 
                          className="rounded-xl bg-white/5 border-white/5 h-12 focus:border-emerald-500/50" 
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Deploy Flag"}
            </Button>
          </form>
        </Form>
      </DialogContent>

    </Dialog>
  )
}

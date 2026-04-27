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
        <Button className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 h-12">
          <Plus className="w-5 h-5 mr-2" />
          Create Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 shadow-2xl p-8 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">Create New Flag</DialogTitle>
          <DialogDescription className="text-slate-500">
            Define a new feature flag and its default value.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400 tracking-wider">Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Beta Checkout" {...field} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11" />
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
                    <FormLabel className="text-xs font-bold uppercase text-slate-400 tracking-wider">Flag Key</FormLabel>
                    <FormControl>
                      <Input placeholder="checkout-v2" {...field} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11 font-mono text-sm" />
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
                  <FormLabel className="text-xs font-bold uppercase text-slate-400 tracking-wider">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain what this flag enables..." {...field} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none min-h-[80px]" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400 tracking-wider">Flag Type</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val)
                      form.setValue("defaultValue", val === "BOOLEAN" ? "false" : "")
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
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
                    <FormLabel className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Default Value ({flagType})
                    </FormLabel>
                    <FormControl>
                      {flagType === "BOOLEAN" ? (
                        <div className="flex items-center h-11 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl justify-between">
                          <span className="text-sm font-bold font-mono uppercase">{field.value}</span>
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
                          className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11" 
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Deploy Key"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

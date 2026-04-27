'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2, X, Check } from "lucide-react"

interface Condition {
  attribute: string
  op: string
  value: string
}

interface RuleEditorProps {
  flagKey: string
  flagType: string
  onSave: () => void
  onCancel: () => void
}

export function RuleEditor({ flagKey, flagType, onSave, onCancel }: RuleEditorProps) {
  const [conditions, setConditions] = useState<Condition[]>([{ attribute: '', op: 'equals', value: '' }])
  const [percentage, setPercentage] = useState<number | null>(null)
  const [value, setValue] = useState(flagType === 'BOOLEAN' ? 'true' : '')
  const [loading, setLoading] = useState(false)

  const addCondition = () => {
    setConditions([...conditions, { attribute: '', op: 'equals', value: '' }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, field: keyof Condition, val: string) => {
    setConditions(conditions.map((c, i) => i === index ? { ...c, [field]: val } : c))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/flags/${flagKey}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conditions,
          percentage,
          value
        })
      })

      if (!res.ok) throw new Error('Failed to save rule')
      onSave()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-4">
        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Conditions (AND)</Label>
        {conditions.map((condition, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center group">
            <Input 
              placeholder="attribute (e.g. email)" 
              value={condition.attribute}
              onChange={(e) => updateCondition(index, 'attribute', e.target.value)}
              className="flex-1 rounded-xl border-none bg-white dark:bg-slate-800 h-11"
            />
            <Select value={condition.op} onValueChange={(val) => updateCondition(index, 'op', val)}>
              <SelectTrigger className="w-full md:w-[160px] rounded-xl border-none bg-white dark:bg-slate-800 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="equals">equals</SelectItem>
                <SelectItem value="not_equals">not_equals</SelectItem>
                <SelectItem value="contains">contains</SelectItem>
                <SelectItem value="starts_with">starts_with</SelectItem>
                <SelectItem value="ends_with">ends_with</SelectItem>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="not_in">not_in</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="value" 
              value={condition.value}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="flex-1 rounded-xl border-none bg-white dark:bg-slate-800 h-11"
            />
            {conditions.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeCondition(index)} className="rounded-xl h-11 w-11 text-slate-400 hover:text-red-500">
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" onClick={addCondition} className="text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 h-10 px-4">
          <Plus size={14} className="mr-2" /> Add Condition
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch 
              checked={percentage !== null} 
              onCheckedChange={(checked) => setPercentage(checked ? 50 : null)} 
            />
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gradual Rollout</Label>
          </div>
          {percentage !== null && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-indigo-600">{percentage}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Targeting Users</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={percentage} 
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Return Value</Label>
          {flagType === 'BOOLEAN' ? (
            <div className="flex items-center justify-between h-11 px-4 bg-white dark:bg-slate-800 rounded-xl border-none">
              <span className="font-mono font-bold text-indigo-600 uppercase text-sm">{value}</span>
              <Switch checked={value === 'true'} onCheckedChange={(checked) => setValue(checked.toString())} />
            </div>
          ) : (
            <Input 
              placeholder="e.g. #ff0000" 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-xl border-none bg-white dark:bg-slate-800 h-11"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel} className="rounded-xl h-12 px-6 font-bold text-slate-500">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
          {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
          Save Targeting Rule
        </Button>
      </div>
    </div>
  )
}

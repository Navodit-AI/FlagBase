'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Plus, Trash2, ShieldCheck, Zap } from "lucide-react"
import { RuleEditor } from "./RuleEditor"
import { toast } from "sonner"

interface Rule {
  id: string
  priority: number
  percentage: number | null
  value: string
  conditions: any[]
}

interface TargetingRulesProps {
  flagKey: string
  flagType: string
  initialRules: Rule[]
}

export function TargetingRules({ flagKey, flagType, initialRules }: TargetingRulesProps) {
  const [rules, setRules] = useState(initialRules)
  const [isAdding, setIsAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r.id === active.id)
      const newIndex = rules.findIndex((r) => r.id === over.id)
      const newRules = arrayMove(rules, oldIndex, newIndex)
      
      setRules(newRules)

      // PATCH priorities
      try {
        const res = await fetch(`/api/flags/${flagKey}/rules/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruleIds: newRules.map(r => r.id) })
        })
        if (!res.ok) throw new Error('Failed to reorder')
        toast.success("Priorities updated")
      } catch (err) {
        setRules(rules)
        toast.error("Failed to update priorities")
      }
    }
  }

  const handleDelete = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/flags/${flagKey}/rules/${ruleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setRules(rules.filter(r => r.id !== ruleId))
      toast.success("Rule deleted")
    } catch (err) {
      toast.error("Failed to delete rule")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-indigo-500 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Custom Targeting Rules</h3>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 h-10 px-6 font-bold text-xs"
          >
            <Plus size={16} className="mr-2" /> Add Rule
          </Button>
        )}
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={rules.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <SortableRuleItem 
                key={rule.id} 
                rule={rule} 
                index={index} 
                onDelete={() => handleDelete(rule.id)} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isAdding && (
        <RuleEditor 
          flagKey={flagKey} 
          flagType={flagType} 
          onSave={() => {
            setIsAdding(false)
            // Refresh logic - ideally fetch or window.location.reload
            window.location.reload()
          }} 
          onCancel={() => setIsAdding(false)} 
        />
      )}

      {rules.length === 0 && !isAdding && (
        <div className="py-20 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
          <Zap className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No targeting rules set yet.</p>
          <p className="text-xs text-slate-400 mt-1">Rules are evaluated from top to bottom.</p>
        </div>
      )}
    </div>
  )
}

function SortableRuleItem({ rule, index, onDelete }: { rule: Rule, index: number, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: rule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderConditions = () => {
    return rule.conditions.map((c, i) => (
      <div key={i} className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 border-none px-2 py-0.5 text-indigo-600 font-mono text-[10px]">
          {c.attribute}
        </Badge>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.op.replace('_', ' ')}</span>
        <Badge variant="outline" className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 px-2 py-0.5 text-slate-700 dark:text-slate-200 font-bold text-[10px]">
          {c.value}
        </Badge>
        {i < rule.conditions.length - 1 && <span className="text-[10px] font-bold text-indigo-400">AND</span>}
      </div>
    ))
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm group hover:shadow-md transition-shadow relative"
    >
      <div className="flex items-center gap-5">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <GripVertical size={20} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            <span className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
              #{index + 1}
            </span>
            <div className="flex gap-3 flex-wrap">
              {renderConditions()}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {rule.percentage && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${rule.percentage}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{rule.percentage}% rollout</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Returns</span>
              <Badge className="bg-emerald-500 text-white border-none shadow-sm font-mono px-3">
                {rule.value}
              </Badge>
            </div>
          </div>
        </div>

        <Button onClick={onDelete} variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  )
}

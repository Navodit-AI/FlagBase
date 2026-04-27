import { getBucket } from './hash'
import { matchesConditions, Condition } from './rules'

type Rule = {
  id: string
  priority: number
  percentage: number | null
  value: string
  conditions: unknown
}

type Override = {
  enabled: boolean
  value: string | null
} | null

type Flag = {
  key: string
  defaultValue: string
  rules: Rule[]
}

export function evaluateFlag(
  flag: Flag,
  override: Override,
  context: Record<string, unknown>
): string {
  // 1. If env override is disabled, return default immediately
  if (!override?.enabled) return flag.defaultValue

  // 2. Walk rules in priority order (should already be sorted asc)
  const sorted = [...flag.rules].sort((a, b) => a.priority - b.priority)

  for (const rule of sorted) {
    const conditions = rule.conditions as Condition[]

    // 3. Check all conditions match
    if (!matchesConditions(conditions, context)) {
      continue
    }

    // 4. Check percentage bucket if set
    if (rule.percentage !== null) {
      const bucket = getBucket(String(context.userId ?? ''), flag.key)
      if (bucket >= rule.percentage) {
        continue
      }
    }

    // 5. Rule matched — return its value
    return rule.value
  }

  // 6. No rule matched — return override value or flag default
  return override.value ?? flag.defaultValue
}

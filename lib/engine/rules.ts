export type ConditionOp =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'ends_with'
  | 'starts_with'
  | 'in'
  | 'not_in'

export type Condition = {
  attribute: string
  op: ConditionOp
  value: string
}

export function matchesConditions(
  conditions: Condition[],
  ctx: Record<string, unknown>
): boolean {
  return conditions.every((c) => {
    const actual = String(ctx[c.attribute] ?? '')
    switch (c.op) {
      case 'equals':      return actual === c.value
      case 'not_equals':  return actual !== c.value
      case 'contains':    return actual.includes(c.value)
      case 'ends_with':   return actual.endsWith(c.value)
      case 'starts_with': return actual.startsWith(c.value)
      case 'in':          return c.value.split(',').map(s => s.trim()).includes(actual)
      case 'not_in':      return !c.value.split(',').map(s => s.trim()).includes(actual)
      default:            return false
    }
  })
}

import { FlagType } from '@prisma/client'

export function parseValue(value: string, type: FlagType): unknown {
  switch (type) {
    case 'BOOLEAN':
      return value === 'true'
    case 'NUMBER':
      return parseFloat(value)
    case 'JSON':
      try { return JSON.parse(value) } catch { return null }
    case 'STRING':
    default:
      return value
  }
}

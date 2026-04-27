import { evaluateFlag } from '../lib/engine/evaluate'
import { getBucket } from '../lib/engine/hash'

// Test 1: disabled override returns default
const flag1 = {
  key: 'test-flag',
  defaultValue: 'false',
  rules: []
}
console.assert(
  evaluateFlag(flag1, { enabled: false, value: null }, { userId: 'u1' }) === 'false',
  'Test 1 failed: disabled override should return default'
)

// Test 2: matching rule returns rule value
const flag2 = {
  key: 'email-flag',
  defaultValue: 'false',
  rules: [{
    id: 'r1',
    priority: 1,
    percentage: null,
    value: 'true',
    conditions: [{ attribute: 'email', op: 'ends_with', value: '@acme.com' }]
  }]
}
console.assert(
  evaluateFlag(flag2, { enabled: true, value: null }, { userId: 'u1', email: 'alice@acme.com' }) === 'true',
  'Test 2 failed: matching condition should return rule value'
)

// Test 3: deterministic bucketing — same user always same bucket
const b1 = getBucket('user_123', 'my-flag')
const b2 = getBucket('user_123', 'my-flag')
console.assert(b1 === b2, 'Test 3 failed: bucket must be deterministic')

console.log('All engine tests passed ✅')

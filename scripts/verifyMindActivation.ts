import assert from 'node:assert/strict';
import { LITTLE_GUYS } from '../src/data/littleGuys';
import { ACTIVE_GUY_MAX, planGuyActivation } from '../src/lib/mindStacking';

const ids = LITTLE_GUYS.slice(0, Math.min(20, LITTLE_GUYS.length)).map((g) => g.id);
assert(ids.length > ACTIVE_GUY_MAX, 'Need more minds than the activation budget for this smoke test.');

for (let i = 0; i < 40; i += 1) {
  const plan = planGuyActivation(ids, i % 2 === 0 ? 'balanced' : 'feral');

  assert.equal(plan.activeIds[0], ids[0], 'Position 1 must remain the protected lead.');
  assert(plan.activeIds.length <= ACTIVE_GUY_MAX, 'Activation plan exceeded the hard mind budget.');
  assert.equal(new Set(plan.activeIds).size, plan.activeIds.length, 'Active minds must be unique.');
  assert.equal(plan.capped, true, 'Oversized pools should report capped=true.');
  assert.equal(plan.slots[0]?.role, 'lead', 'First active slot must be LEAD.');

  const roles = new Set(plan.slots.map((slot) => slot.role));
  assert(roles.has('counterforce'), 'Large activation plans should contain a COUNTERFORCE.');
  assert(roles.has('wildcard'), 'Large activation plans should contain a WILDCARD.');

  for (const id of plan.activeIds) {
    assert(ids.includes(id), 'Activation may only draw from the user-selected pool.');
  }
}

const small = ids.slice(0, 4);
const smallPlan = planGuyActivation(small, 'balanced');
assert.deepEqual(smallPlan.activeIds, small, 'Pools within budget must remain intact and ordered.');
assert.equal(smallPlan.capped, false, 'Small pools must not report budget capping.');

const duplicatePlan = planGuyActivation([ids[0], ids[1], ids[0], ids[2], ids[1]], 'balanced');
assert.deepEqual(
  duplicatePlan.activeIds,
  [ids[0], ids[1], ids[2]],
  'Duplicate IDs must collapse before activation.'
);

console.log(
  'Mind activation verified:',
  ACTIVE_GUY_MAX,
  'max active minds, lead preservation, role assignment, dedupe, and pool-only selection.'
);

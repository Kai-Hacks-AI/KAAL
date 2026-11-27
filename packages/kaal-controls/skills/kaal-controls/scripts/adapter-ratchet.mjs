// verify Adapter as a ratchet over the complete map of delivered controls. Pure: it reads no file, runs no command and knows no repository.
// The check is findUnadapted; the mode and the allowance are the adapter's. A delivered map that is not complete, current and well formed
// cannot be judged (a malformed entry list is refused by findUnadapted itself), so the answer is unknown and blocked, and no allowance can hide a control that is missing from it.
import { runControl } from './adapter.mjs';
import { findUnadapted } from './verify-adapter.mjs';

const text = (v) => typeof v === 'string' && v.length > 0;
const usable = (d, revision, scope) => d !== null && typeof d === 'object' && !Array.isArray(d)
  && d.complete === true && d.revision === revision && d.scope === scope;

export async function runAdapterRatchet({ controls, delivered, observed, revision, scope, baseline, previous, boundary } = {}) {
  const check = () => {
    if (!text(revision) || !text(scope)) throw new Error('runAdapterRatchet: revision and scope must be non-empty strings');
    if (!usable(delivered, revision, scope)) throw new Error('runAdapterRatchet: the delivered inventory is not usable');
    return findUnadapted({ controls, delivered: delivered.entries, observed, revision });
  };
  return runControl({ id: 'controls/CTL1', mode: 'ratchet', check, baseline, previous, boundary });
}

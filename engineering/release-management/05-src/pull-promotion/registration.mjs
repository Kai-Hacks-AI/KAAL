// KAAL's installation adapter for pull Promotion (pull/C14). It knows what is specific to KAAL: the stocks hotfix/*, wire/* and kaal/<scope>/*,
// their delivery priority, and the Pull opt-in file packages/<package>/kaal-pull.json ({"scope": "<core scope>"}). From the files of main's tip and
// the Core evidence of main it produces the normalized registry the reusable kaal-release package consumes: {accepted, stocks: [{name, routes, pull?, type?}]}.
// Capability identity and scope are Core's. This adapter keeps no capability registry: an opt-in counts only when engineering/C15's assessment says the
// scope is claimed once by a Core Registration whose holder is an admitted Capability; the route is built from that claimed scope, never from a name.
// Pure and read-only. `tree` is {ref, files: {path: text}}; `core` is the evidence engineering/C15 reads from main ({registrations: {claims, collisions}, capabilities}).
// Only a tree whose ref is `main` is accepted: a PR head, a collector tree or a hand-passed declaration is test input and fails closed.
import { collectorCapability } from '../../../collector-capability/collector-capability.mjs';

export const OPT_IN_FILE = /^packages\/[^/]+\/kaal-pull\.json$/;
const SCOPE = /^[a-z0-9][a-z0-9-]*$/;
const CLASS_ROUTES = { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] };

export function discoverRegistrations(tree, core) {
  const problems = [];
  const files = tree && typeof tree === 'object' && tree.files && typeof tree.files === 'object' ? tree.files : {};
  const fromMain = tree?.ref === 'main';
  if (!fromMain) problems.push(`the tree is not main's tip (${tree?.ref ?? 'none'}): it is test input, not an accepted registration`);
  const seen = new Map();
  const scopes = [];
  for (const path of Object.keys(files).filter((p) => OPT_IN_FILE.test(p)).sort()) {
    let data;
    try { data = JSON.parse(files[path]); } catch (e) { problems.push(`${path}: not valid JSON (${e.message})`); continue; }
    const keys = data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : [];
    if (keys.length !== 1 || keys[0] !== 'scope') { problems.push(`${path}: must be exactly {"scope": "<core scope>"}`); continue; }
    if (typeof data.scope !== 'string' || !SCOPE.test(data.scope)) { problems.push(`${path}: the scope is not one lowercase path segment`); continue; }
    if (seen.has(data.scope)) { problems.push(`${path}: duplicate of ${seen.get(data.scope)}, the scope ${data.scope} is already opted in`); continue; }
    seen.set(data.scope, path);
    if (!fromMain) continue;
    // Capability identity is Core's: reuse engineering/C15's assessment on the evidence of main; only PASS authorizes, UNKNOWN never does.
    const verdict = collectorCapability(`kaal/${data.scope}/pull`, core);
    if (verdict.verdict !== 'PASS') { problems.push(`${path}: Core does not authorize the scope ${data.scope} (${verdict.verdict}: ${verdict.reason})`); continue; }
    scopes.push(data.scope);
  }
  const registry = {
    accepted: fromMain,
    stocks: [
      { name: 'HOTFIX', routes: [...CLASS_ROUTES.HOTFIX] },
      { name: 'WIRE', routes: [...CLASS_ROUTES.WIRE] },
      { name: 'KAAL', routes: scopes.map((s) => `kaal/${s}/*`), pull: 'open-promotion', type: 'PROMOTION' },
    ],
  };
  return { accepted: fromMain, source: fromMain ? 'main' : tree?.ref ?? null, classRoutes: { HOTFIX: [...CLASS_ROUTES.HOTFIX], WIRE: [...CLASS_ROUTES.WIRE] }, problems, registry };
}

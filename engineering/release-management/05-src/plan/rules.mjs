// A10 plan-rules: evaluates the eight rules of F1 over a resolved plan model.
import { capabilityOf, childrenOf, closersOf, cycleMembers, decomposed, kindOf, nearestShared } from './resolve.mjs';

const fail = (rule, id, message, recovery) => ({ rule, id, status: 'fail', message, recovery });
const unknown = (rule, id, message, recovery) => ({ rule, id, status: 'unknown', message, recovery });
const list = (value) => (Array.isArray(value) ? value : []);

function checkLinks(plan, byId, findings) {
  const link = (id, verb, target, kinds) => {
    const kind = kindOf(byId, target);
    if (kind === undefined) findings.push(fail('F1/4', id, `${id} ${verb} ${target}, which does not resolve`, `Create ${target} or correct the ${verb} link on ${id}.`));
    else if (!kinds.includes(kind)) findings.push(fail('F1/4', id, `${id} ${verb} ${target}, which is a ${kind}`, `Point the ${verb} link on ${id} at ${kinds.join(' or ')}.`));
  };
  for (const change of list(plan.changes)) {
    for (const target of list(change.implements)) link(change.id, 'implements', target, ['intent']);
    for (const target of list(change.resolves)) link(change.id, 'resolves', target, ['defect']);
    for (const target of list(change.closes)) link(change.id, 'closes', target, ['gap']);
  }
  for (const requirement of list(plan.requirements)) for (const target of list(requirement.serves)) link(requirement.id, 'serves', target, ['intent']);
  for (const element of list(plan.architecture)) for (const target of list(element.addresses)) link(element.id, 'addresses', target, ['requirement', 'defect']);
}

// Every node has one id grammar, <capability>/<kind><n>, and ids are unique. No id encodes a place.
const KINDS = { intent: ['I'], requirement: ['F', 'N'], architecture: ['A'], defect: ['D'], change: ['C'], gap: ['G'], case: ['T'] };
function checkIds(plan, byId, findings) {
  const form = (id, letters) => {
    const match = typeof id === 'string' ? /^([a-z][a-z0-9-]*)\/([A-Z])(\d+)$/.exec(id) : null;
    return match !== null && letters.includes(match[2]);
  };
  const bad = (id, letters) => findings.push(fail('F1/4', id, `${id} is not an id of the form <capability>/<kind><n>`, `Write the id of ${id} as <capability>/<kind><n> with kind ${letters.join(' or ')}, for example release/${letters[0]}1, and use that id in every link.`));
  const seen = new Set();
  const nodes = [];
  for (const [kind, items] of [['intent', plan.intents], ['requirement', plan.requirements], ['architecture', plan.architecture], ['defect', plan.defects], ['change', plan.changes], ['gap', plan.gaps], ['case', plan.cases]]) {
    for (const item of list(items)) nodes.push([kind, item]);
  }
  for (const [kind, item] of nodes) {
    if (!form(item.id, KINDS[kind])) bad(item.id, KINDS[kind]);
    else if (seen.has(item.id)) findings.push(fail('F1/4', item.id, `${item.id} is not unique`, `Give each node its own id, or remove the duplicate ${item.id}.`));
    seen.add(item.id);
  }
}

export function evaluate(plan, byId) {
  const findings = [];
  checkLinks(plan, byId, findings);
  checkIds(plan, byId, findings);

  // F1/1: a Change has at least one driver and closes at least one Gap. A Change may close several Gaps. Every Gap, a parent Gap included, has exactly one closing Change.
  for (const change of list(plan.changes)) {
    if (list(change.implements).length + list(change.resolves).length === 0) {
      findings.push(fail('F1/1', change.id, `${change.id} implements no Intent and resolves no Defect`, `Add an implements link to an Intent or a resolves link to a Defect on ${change.id}.`));
    }
    if (list(change.closes).length === 0) {
      findings.push(fail('F1/1', change.id, `${change.id} closes no Gap`, `Add a closes link from ${change.id} to the Gap it closes, or remove ${change.id}.`));
    }
  }
  for (const gap of list(plan.gaps)) {
    const closers = closersOf(byId, gap.id);
    if (closers.length === 0) findings.push(fail('F1/1', gap.id, `Gap ${gap.id} is closed by no Change`, `Add a closes link to ${gap.id} on the Change that closes it.`));
    else if (closers.length > 1) findings.push(fail('F1/1', gap.id, `Gap ${gap.id} is closed by ${closers.length} Changes: ${closers.join(', ')}`, `Decompose ${gap.id} into child Gaps through parent links and let each Change close its own Gaps.`));
  }

  // F1/2: a Requirement serves an Intent.
  for (const requirement of list(plan.requirements)) {
    if (list(requirement.serves).length === 0) {
      findings.push(fail('F1/2', requirement.id, `${requirement.id} serves no Intent`, `Add a serves link from ${requirement.id} to an Intent.`));
    }
  }

  // F1/3: an Architecture element addresses something, and parent is same-kind decomposition without cycles.
  for (const element of list(plan.architecture)) {
    if (list(element.addresses).length === 0) {
      findings.push(fail('F1/3', element.id, `${element.id} addresses no Requirement or Defect`, `Add an addresses link from ${element.id} to a Requirement or Defect. A parent link does not count.`));
    }
  }
  const cyclic = cycleMembers(byId);
  for (const { id, kind, parent } of decomposed(byId)) {
    const parentKind = kindOf(byId, parent);
    if (parentKind === undefined) findings.push(fail('F1/3', id, `${id} has parent ${parent}, which does not exist`, `Create ${parent} or correct the parent link on ${id}.`));
    else if (parentKind !== kind) findings.push(fail('F1/3', id, `${id} is a ${kind} and has parent ${parent}, which is a ${parentKind}`, `Point the parent link on ${id} at a ${kind}.`));
    else if (cyclic.has(id)) findings.push(fail('F1/3', id, `${id} sits on a parent cycle`, `Break the parent cycle at ${id}.`));
  }

  // A plan without a cases field has no Cases: every required element is then reported as uncovered.
  const cases = list(plan.cases);
  // F1/4: Case validity and coverage.
  const tested = new Set();
  for (const entry of cases) {
    const tests = list(entry.tests);
    if (tests.length === 0) findings.push(fail('F1/4', entry.id, `Case ${entry.id} tests no target`, `Name at least one target in the tests list of ${entry.id}.`));
    for (const target of tests) {
      if (kindOf(byId, target) === undefined) findings.push(fail('F1/4', entry.id, `Case ${entry.id} tests ${target}, which does not resolve`, `Correct the target ${target} of ${entry.id}.`));
      else if (kindOf(byId, target) === 'case') findings.push(fail('F1/4', entry.id, `Case ${entry.id} tests ${target}, which is a Case`, `Name an element or a gap as the target of ${entry.id}. A target never references a Case.`));
      else tested.add(target);
    }
  }
  for (const [id, { kind }] of byId) {
    if (!tested.has(id) && ['intent', 'requirement', 'architecture', 'defect', 'gap'].includes(kind)) {
      findings.push(fail('F1/4', id, `${kind} ${id} has no outer-loop Case`, `Add a Case that tests ${id}.`));
    }
  }

  for (const entry of cases) {
    const tests = list(entry.tests).filter((target) => kindOf(byId, target) !== undefined);
    if (tests.length === 0) continue;
    // F1/5: a Case sits where its targets sit. The reader observes the folder the Case was found in; the Case itself declares no place.
    const capabilities = new Set([...byId.keys()].map(capabilityOf).filter(Boolean));
    const place = entry.found;
    const placeKind = capabilities.has(place) && !byId.has(place) ? 'capability' : kindOf(byId, place);
    if (placeKind === undefined) findings.push(unknown('F1/5', entry.id, place === undefined ? `Case ${entry.id} has no observed place` : `Case ${entry.id} was found at ${place}, which the plan does not declare`, `Read the folder of Case ${entry.id}. It sits beside the nearest shared ancestor of its targets, then the common Intent, then the capability.`));
    else {
      const expected = nearestShared(byId, tests);
      if (place !== expected) findings.push(fail('F1/5', entry.id, `Case ${entry.id} sits at ${place}, and the nearest shared ancestor of its targets is ${expected}`, `Move Case ${entry.id} beside ${expected}.`));
    }
    // F1/7: Change-oriented and target-oriented Cases stay apart.
    const gaps = tests.filter((target) => kindOf(byId, target) === 'gap');
    if (gaps.length > 0 && gaps.length < tests.length) findings.push(fail('F1/7', entry.id, `Case ${entry.id} tests Change gaps and targets together`, `Split ${entry.id} into a Change-oriented Case and a target-oriented Case.`));
    else if (placeKind === undefined) findings.push(unknown('F1/7', entry.id, `Case ${entry.id} has no resolvable place, so it cannot be told apart as Change-oriented or target-oriented`, `Read the folder of Case ${entry.id}.`));
    // A Case on Gaps sits where F1/5 derives it: beside the closing Change, or at the shared ancestor of several Changes.
    else if (gaps.length === 0 && placeKind === 'change') findings.push(fail('F1/7', entry.id, `Case ${entry.id} tests targets and sits beside a Change`, `Move ${entry.id} beside the target it tests.`));
  }

  // F1/6: at least one meaningful observed RED condition (A9 reads the evidence).
  if (!Array.isArray(plan.evidence)) {
    findings.push(unknown('F1/6', 'evidence', 'No current evaluation evidence is available', 'Supply the current evaluation evidence of the outer-loop Cases.'));
  } else {
    // A RED condition counts only when it belongs to this plan: a declared Case, and one of that Case's resolved targets.
    const declared = new Map(list(plan.cases).map((entry) => [entry.id, list(entry.tests)]));
    const meaningful = plan.evidence.some((entry) => entry.result === 'failed' && entry.reason === 'assertion'
      && declared.has(entry.case) && declared.get(entry.case).includes(entry.target) && kindOf(byId, entry.target) !== undefined);
    if (!meaningful) {
      const names = [...declared.keys()];
      findings.push(fail('F1/6', 'evidence', 'The PLAN has no meaningful observed RED condition', `Execute a Case of this plan (${names.length > 0 ? names.join(', ') : 'none declared yet'}) so that it fails on an assertion about one of its own unfulfilled targets. A pass, an unconditional failure, a missing import and a result for a Case or target outside this plan do not count.`));
    }
  }
  // F1/3: a parent is done only when its children are done, for every kind that is tested. An element is done when a Case that tests it passed and all its children are done.
  if (Array.isArray(plan.evidence)) {
    const testsOf = new Map(list(plan.cases).map((entry) => [entry.id, list(entry.tests)]));
    const passed = new Set(plan.evidence.filter((entry) => entry && entry.result === 'passed' && testsOf.has(entry.case)).flatMap((entry) => testsOf.get(entry.case)));
    const done = (id, seen = new Set()) => passed.has(id) && !seen.has(id) && childrenOf(byId, id).every((child) => done(child, new Set([...seen, id])));
    for (const id of passed) {
      if (!byId.has(id)) continue;
      const open = childrenOf(byId, id).filter((child) => !done(child));
      if (open.length > 0) findings.push(fail('F1/3', id, `${id} has a passing Case, and its children ${open.join(', ')} are not done`, `Complete ${open.join(', ')} first or in the same Change. A parent is done only when its children are done.`));
    }
  }
  return findings;
}

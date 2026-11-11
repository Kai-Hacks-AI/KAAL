// A10 plan-rules: evaluates the eight rules of F1 over a resolved plan model.
import { cycleMembers, decomposed, kindOf, nearestShared } from './resolve.mjs';

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
  }
  for (const requirement of list(plan.requirements)) for (const target of list(requirement.serves)) link(requirement.id, 'serves', target, ['intent']);
  for (const element of list(plan.architecture)) for (const target of list(element.addresses)) link(element.id, 'addresses', target, ['requirement', 'defect']);
}

export function evaluate(plan, byId) {
  const findings = [];
  checkLinks(plan, byId, findings);

  // F1/1: a Change has at least one driver.
  for (const change of list(plan.changes)) {
    if (list(change.implements).length + list(change.resolves).length === 0) {
      findings.push(fail('F1/1', change.id, `${change.id} implements no Intent and resolves no Defect`, `Add an implements link to an Intent or a resolves link to a Defect on ${change.id}.`));
    }
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

  const cases = Array.isArray(plan.cases) ? plan.cases : undefined;
  if (cases) {
    // F1/4: Case validity and coverage.
    const seen = new Set();
    const tested = new Set();
    for (const entry of cases) {
      if (seen.has(entry.id)) findings.push(fail('F1/4', entry.id, `Case ${entry.id} is not unique`, `Give each Case its own identity, or remove the duplicate ${entry.id}.`));
      seen.add(entry.id);
      const tests = list(entry.tests);
      if (tests.length === 0) findings.push(fail('F1/4', entry.id, `Case ${entry.id} tests no target`, `Name at least one target in the tests list of ${entry.id}.`));
      for (const target of tests) {
        if (kindOf(byId, target) === undefined) findings.push(fail('F1/4', entry.id, `Case ${entry.id} tests ${target}, which does not resolve`, `Correct the target ${target} of ${entry.id}.`));
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
      // F1/5: a Case sits where its identity says, at the nearest shared ancestor of its targets.
      const place = String(entry.id).split('/')[0];
      const placeKind = kindOf(byId, place);
      if (placeKind === undefined) findings.push(unknown('F1/5', entry.id, `Case ${entry.id} is placed at ${place}, which the plan does not declare`, `Place Case ${entry.id} under an element or Change of this plan, and name it by that identity.`));
      else {
        const expected = nearestShared(byId, tests);
        if (place !== expected) findings.push(fail('F1/5', entry.id, `Case ${entry.id} sits at ${place}, and the nearest shared ancestor of its targets is ${expected}`, `Move Case ${entry.id} beside ${expected}.`));
      }
      // F1/7: Change-oriented and target-oriented Cases stay apart.
      const gaps = tests.filter((target) => kindOf(byId, target) === 'gap');
      if (gaps.length > 0 && gaps.length < tests.length) findings.push(fail('F1/7', entry.id, `Case ${entry.id} tests Change gaps and targets together`, `Split ${entry.id} into a Change-oriented Case and a target-oriented Case.`));
      else if (placeKind === undefined) findings.push(unknown('F1/7', entry.id, `Case ${entry.id} has no resolvable location, so it cannot be told apart as Change-oriented or target-oriented`, `Place Case ${entry.id} under an element or Change of this plan.`));
      else if (gaps.length > 0 && placeKind !== 'change') findings.push(fail('F1/7', entry.id, `Case ${entry.id} tests Change gaps and sits at ${place}, which is not a Change`, `Move ${entry.id} beside its Change.`));
      else if (gaps.length === 0 && placeKind === 'change') findings.push(fail('F1/7', entry.id, `Case ${entry.id} tests targets and sits beside a Change`, `Move ${entry.id} beside the target it tests.`));
    }
  }

  // F1/6: at least one meaningful observed RED condition (A9 reads the evidence).
  if (!Array.isArray(plan.evidence)) {
    findings.push(unknown('F1/6', 'evidence', 'No current evaluation evidence is available', 'Supply the current evaluation evidence of the outer-loop Cases.'));
  } else if (!plan.evidence.some((entry) => entry.result === 'failed' && entry.reason === 'assertion' && typeof entry.target === 'string')) {
    findings.push(fail('F1/6', 'evidence', 'The PLAN has no meaningful observed RED condition', 'Execute an outer-loop Case that fails on an assertion about an unfulfilled target. A pass, an unconditional failure and a missing import do not count.'));
  }
  return findings;
}

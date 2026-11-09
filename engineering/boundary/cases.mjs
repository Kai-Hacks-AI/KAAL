// The provisional, Engineering-owned Case adapter (engineering/boundary/PLAN.md, "Embedding"). It turns a capability's
// Boundary Test definitions into Case descriptors that map one-to-one onto Testing's Case later. It defines no Case, Suite
// or result semantics: a run gives evidence (completeness, findings, coverage) and a disposition (decided / undecided
// by finding id and line digest from the decisions the caller passes in). It returns no pass or fail.
// A Case's evidence is the evidence of its own test, run alone (engineering/boundary/PLAN.md, "Embedding").
import { loadDefinition } from "./definition.mjs";
import { scan } from "./scan.mjs";

/** One descriptor per test of the given definition files. A definition that is refused throws. */
export function boundaryCases(definitionFiles) {
  return definitionFiles.flatMap((file) => {
    const definition = loadDefinition(file);
    return definition.tests.map((test) => ({
      id: `${definition.provider}/${test.id}`,
      suite: "boundary",
      tests: test.tests,
      ships: test.ships,
      async run({ targets, base, decisions = [] }) {
        // Each Case runs its own test alone, so its findings, coverage and completeness are its own: another test matching the
        // same place, or another test's unreadable reference, can neither hide nor mask this Case's evidence. The aggregate
        // presentation (engine.mjs, scan of the whole definition) stays one finding per place, attributed to the first matching test.
        const evidence = scan([{ ...definition, tests: [test] }], targets, base);
        const findings = evidence.findings;
        const decided = findings.filter((f) => decisions.some((d) => d.id === f.id && d.digest === f.digest)).map((f) => f.id);
        return { result: evidence.result, findings, coverage: evidence.coverage, decided, undecided: findings.map((f) => f.id).filter((id) => !decided.includes(id)) };
      },
    }));
  });
}

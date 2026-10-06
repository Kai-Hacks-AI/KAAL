// The commands over changes.ts; each is a thin entry that prints and sets an exit code.
import { admit } from "./admission.js";
import { checkChanges, closedChanges, sealChange } from "./changes.js";
import { closeStep, sealWorkStep, stateOf } from "./process.js";

const [command, kaalDir, change, ...extra] = process.argv.slice(2);
const usage = "usage: change-seal seal <kaal-dir> <change> | seal-work <kaal-dir> <change> | state <kaal-dir> <change> | close <kaal-dir> <change> | closed <kaal-dir> | check <kaal-dir> | admit <baseline-kaal-dir> <candidate-kaal-dir>";
try {
  if (command === "seal" && kaalDir && change && extra.length === 0) {
    console.log(sealChange(kaalDir, change));
  } else if (command === "seal-work" && kaalDir && change && extra.length === 0) {
    console.log(sealWorkStep(kaalDir, change));
  } else if (command === "close" && kaalDir && change && extra.length === 0) {
    console.log(closeStep(kaalDir, change));
  } else if (command === "state" && kaalDir && change && extra.length === 0) {
    const state = stateOf(kaalDir, change);
    console.log(state.stage);
    console.log(`next: ${state.next}`);
    for (const p of state.problems) console.log(`problem: ${p}`);
    process.exitCode = state.problems.length === 0 ? 0 : 1;
  } else if (command === "closed" && kaalDir && !change) {
    for (const c of closedChanges(kaalDir)) console.log(`${c.path} ${c.id}`);
  } else if (command === "check" && kaalDir && !change) {
    const problems = checkChanges(kaalDir);
    for (const p of problems) console.error(p);
    process.exitCode = problems.length === 0 ? 0 : 1;
  } else if (command === "admit" && kaalDir && change && extra.length === 0) {
    const verdict = admit(kaalDir, change);
    if (verdict.admitted) console.log(`admitted: ${verdict.change}`);
    for (const r of verdict.reasons) console.error(r);
    process.exitCode = verdict.admitted ? 0 : 1;
  } else {
    console.error(usage);
    process.exitCode = 2;
  }
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}

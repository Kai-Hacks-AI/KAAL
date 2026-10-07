#!/usr/bin/env node
// The entry the workflows run: `node packages/kaal-github/dist/cli.js <control> <target-ref>`,
// from the root of the checkout under test. Exit 0 when the control holds, 1 when it does not, 2 on usage.
import { CONTROLS } from "./controls.js";

const [control, target, ...extra] = process.argv.slice(2);
if (!control || !(control in CONTROLS) || !target || extra.length > 0) {
  console.error(`usage: cli <${Object.keys(CONTROLS).join(" | ")}> <target-ref>`);
  process.exitCode = 2;
} else {
  try {
    const verdict = CONTROLS[control](process.cwd(), target);
    for (const line of verdict.messages) console.error(line);
    process.exitCode = verdict.ok ? 0 : 1;
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}

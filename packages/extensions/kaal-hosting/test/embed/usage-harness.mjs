// Execute the actual shipped example, without rewriting its imports or operation.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { node, PACKAGE } from "./harness.mjs";

export async function usageExample(name, input) {
  const reference = join(PACKAGE, "skills/kaal-hosting/references/operations.md");
  assert.ok(existsSync(reference), "the installed usage Skill ships its operations reference");
  const text = readFileSync(reference, "utf8");
  const examples = [...text.matchAll(/```js hosting:([a-z-]+)\r?\n([\s\S]*?)\r?\n```/g)];
  const matching = examples.filter((m) => m[1] === name);
  assert.equal(matching.length, 1, `one actual shipped ${name} example is required`);
  const script = `${matching[0][2]}\ntry {
    const value = await run(JSON.parse(process.env.KAAL_HOSTING_USAGE_INPUT));
    console.log("hosting-usage-example " + JSON.stringify({ value }));
  } catch (error) {
    console.log("hosting-usage-example " + JSON.stringify({ error: {
      name: error.name, code: error.code, findings: error.findings,
      kept: error.kept, leftovers: error.leftovers, message: error.message
    } }));
    process.exitCode = 1;
  }`;
  const env = { ...process.env, KAAL_HOSTING_USAGE_INPUT: JSON.stringify(input) };
  delete env.NODE_TEST_CONTEXT;
  const output = await node(["--input-type=module", "-e", script], { cwd: PACKAGE, env });
  const lines = output.stdout.split(/\r?\n/).filter((line) => line.startsWith("hosting-usage-example "));
  assert.equal(lines.length, 1, `the example must execute, not fail to import or parse:\n${output.stderr}`);
  return { ...output, ...JSON.parse(lines[0].slice("hosting-usage-example ".length)) };
}

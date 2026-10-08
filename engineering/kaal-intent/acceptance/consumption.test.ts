// How the Intent is consumed. Review examines it like any result; Sealing's
// identity agrees with Intent's, so there is one meaning of a file's identity;
// and Changing KAAL consumes it by wording alone, keeping its fixed target,
// without changing what it reads or needing Intent to work. Installed as an
// agent has them: the delivered Skills alone, side by side.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as changing from "kaal-changing";
import * as sealing from "kaal-sealing";
import { payload as review } from "kaal-review";
import { payload as intent } from "kaal-intent";
import { read, scratch } from "../helpers/setup.js";

type After = { after: (fn: () => void) => void };
const C = "changes/genesis/26/10/08/02";
const INTENT = "# Intent — A trip in one evening\n\nWanted: planning a trip in one evening, because evenings are all there is.\nNot wanted: booking anything.\n";

function embedding(t: After, extra: Record<string, string>) {
  const root = scratch(t);
  for (const [path, content] of Object.entries({ ...changing.payload().skills, ...sealing.payload().skills, ...extra })) {
    mkdirSync(dirname(join(root, "skills", path)), { recursive: true });
    writeFileSync(join(root, "skills", path), content);
  }
  const kaal = join(root, ".kaal");
  mkdirSync(join(kaal, C, "work"), { recursive: true });
  writeFileSync(join(root, "intent.md"), INTENT);
  writeFileSync(join(kaal, C, "work", "01-intent.md"), INTENT);
  return { root, kaal };
}
type E = ReturnType<typeof embedding>;
const node = (args: string[], cwd: string) => spawnSync("node", args, { encoding: "utf8", cwd });
const identity = (e: E, file = "intent.md") => node([join(e.root, "skills/kaal-intent/scripts/intent.mjs"), "identity", join(e.root, file)], e.root);

test("Sealing's identity of the file and Intent's are one and the same: Intent invents no second meaning", (t) => {
  const e = embedding(t, { ...intent().skills, ...review().skills });
  const sealed = node([join(e.root, "skills/kaal-sealing/scripts/artifact-id.mjs"), join(e.root, "intent.md")], e.root);
  assert.equal(sealed.status, 0, sealed.stderr);
  assert.equal(identity(e).stdout.trim(), sealed.stdout.trim());
});

test("an Intent is a result Review examines like any other, and convergence is on exactly its identity", (t) => {
  const e = embedding(t, { ...intent().skills, ...review().skills });
  const id = identity(e).stdout.trim();
  const rounds = join(e.root, "rounds");
  mkdirSync(rounds);
  const script = join(e.root, "skills/kaal-review/scripts/review.mjs");
  const who = "assigned to this seat by the owner, apart from the one who described it";
  const write = (n: string, outcome: string, ...rest: string[]) => node([script, "write", join(rounds, `${n}.md`), "--of", "Intent", "--identity", id, "--outcome", outcome, "--reviewer", who, ...rest], e.root);
  assert.equal(write("01", "findings", "--findings", "1. the boundary 'booking' is unclear").status, 0);
  assert.equal(node([script, "converged", rounds, id], e.root).status, 1);
  assert.equal(write("02", "converged").status, 0);
  assert.equal(node([script, "converged", rounds, id], e.root).status, 0);
  writeFileSync(join(e.root, "intent.md"), INTENT.replace("booking", "reserving"));
  assert.notEqual(identity(e).stdout.trim(), id, "a revised Intent is another Intent");
  assert.equal(node([script, "converged", rounds, identity(e).stdout.trim()], e.root).status, 1, "and review has not converged on it");
});

test("the Change process reads an Intent-established change as it read any other, and Intent need not be there", (t) => {
  for (const extra of [{}, intent().skills]) {
    const e = embedding(t, extra);
    const before = read(e.root);
    const r = node([join(e.root, "skills/kaal-changing/scripts/change-state.mjs"), e.kaal, C], e.root);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.split("\n")[0], "WORK OPEN");
    assert.deepEqual(read(e.root), before, "and it writes nothing");
  }
});

test("the copy of the Intent in work/ keeps the established identity until it is changed, which the identity then shows", (t) => {
  const e = embedding(t, intent().skills);
  const established = identity(e).stdout.trim();
  assert.equal(identity(e, `.kaal/${C}/work/01-intent.md`).stdout.trim(), established);
  writeFileSync(join(e.kaal, C, "work", "01-intent.md"), INTENT + "Also wanted: a pony.\n");
  assert.notEqual(identity(e, `.kaal/${C}/work/01-intent.md`).stdout.trim(), established, "an edited Intent in work/ is no longer the established one");
});

test("Changing KAAL names Intent where it is established, keeps the fixed target, and does not depend on it", () => {
  const { skills } = changing.payload();
  const manifest = skills["kaal-changing/SKILL.md"]!;
  const reference = skills["kaal-changing/references/rowing.md"]!;
  assert.match(manifest, /The Intent is the fixed target: never change it inside the change/);
  assert.match(manifest, /optional `kaal-intent` Skill \(Node `Intent`\), the Worker keeps it in `work\/01-intent\.md` byte for byte/);
  assert.match(manifest, /a copy in `work\/` that no longer has that identity has been changed, which no one inside the change may do/);
  assert.match(manifest, /a different want is another Intent for another change, never an edit of this one/);
  assert.match(manifest, /A Change does not need Intent to work/);
  assert.match(reference, /Intent as given and never changed by the Worker, byte for byte as established where the optional `kaal-intent` Skill \(Node `Intent`\) established it/);
  assert.match(reference, /The Intent is the fixed target and is not renegotiated in review/);
  assert.doesNotMatch(manifest.split("---")[1]!, /kaal-intent/, "the compatibility line declares no sibling Intent");
  assert.ok(!Object.keys(skills).some((p) => p.includes("kaal-intent")), "Changing KAAL ships nothing of Intent's");
});

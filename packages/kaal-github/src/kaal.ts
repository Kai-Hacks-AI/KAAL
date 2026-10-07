// KAAL, reached across a process boundary: the repository's own commands, run
// from its root, whose exit code and messages are all this extension reads.
// Nothing of KAAL is imported, so nothing here can come to depend on how KAAL
// decides; the direction is host to KAAL and never back.
import { spawnSync } from "node:child_process";

export interface Verdict {
  ok: boolean;
  messages: string[];
}

/** Run one of the repository's KAAL commands, e.g. `check-kaal-admission`, over a baseline and a candidate KAAL directory, from `root`: the repository that carries them. */
export function kaal(command: string, baseline: string, candidate: string, root: string): Verdict {
  const r = spawnSync("npm", ["run", "-s", command, "--", baseline, candidate], { cwd: root, encoding: "utf8" });
  if (r.error) throw r.error;
  const lines = (r.stderr + r.stdout).split("\n").filter((l) => l.trim() !== "");
  return { ok: r.status === 0, messages: lines };
}

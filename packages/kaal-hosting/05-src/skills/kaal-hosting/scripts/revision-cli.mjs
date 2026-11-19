#!/usr/bin/env node
// kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]...
//   Reads the files of a revision through Hosting's `readRevision` and prints one `kaal-hosting-revision {…}` line:
//   the commit and, per file, its path, size and SHA-256 (the bytes are not printed). It prints facts, not a verdict:
//   whether this is the revision the caller meant is the caller's judgment. Exit 0 when the revision was read,
//   including when `--under` matches nothing; 2 when it could not be (no such revision, unreadable repository or
//   entry, bad arguments), with the code and reason in the line. It never exits 1: nothing here can fail a check.
import { digest, readRevision, revision } from "./index.js";

const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const many = (flag) => args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const LINE = "kaal-hosting-revision";
const say = (result) => console.log(`${LINE} ${JSON.stringify(result)}`);
const root = value("--root");
const ref = value("--ref");
const limit = many("--under");
if (!root || !ref || limit.some((p) => p === undefined || p.startsWith("--"))) {
  say({ result: "cannot-determine", code: "USAGE", reason: "usage: kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]..." });
  process.exitCode = 2;
} else {
  try {
    const { commit } = await revision(root, ref);
    const files = await readRevision(root, commit, limit.length ? { under: limit } : {});
    say({ result: "read", commit, files: Object.keys(files).sort().map((path) => ({ path, bytes: files[path].length, sha256: digest(files[path]) })) });
  } catch (e) {
    say({ result: "cannot-determine", code: e?.code ?? "ERROR", reason: String(e?.message ?? e) });
    process.exitCode = 2;
  }
}

#!/usr/bin/env node
// Privacy: generic detectors for private material that must not be committed or published.
//
// Usage: check.mjs [--local <file>] [--paths] [--pack <tarball>]... [<dir>]...
// Scans every file of each directory (read through kaal-hosting), every file packed in each
// tarball as npm would publish it, and with --paths the files named on stdin, NUL- or
// newline-separated, as `git ls-files -z` supplies them. The caller decides which files make up
// the repository; this file alone defines the rules. Exits 0 when nothing is found, 1 with one line per finding,
// 2 when it cannot judge. Findings are masked: a log never reproduces the value it found.
//
// The rules know only generic shapes and the synthetic values in check.test.mjs. A user's own
// private identifiers are checked only with --local (or KAAL_PRIVACY_LOCAL): an untracked file
// outside this repository, one literal per line. That list never belongs in the repository, in
// CI variables or in secrets.
//
// Limitation: these are pattern checks. A clean result does not establish that prose is free of
// private information; review still decides that.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Content rules. Each exception is narrow and says why it is legitimate.
 * `allow` receives the matched text and returns a reason, or nothing.
 */
const RULES = [
  {
    rule: "email",
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
    allow: (m) => {
      const domain = m.slice(m.indexOf("@") + 1).toLowerCase();
      if (/^(?:[a-z0-9-]+\.)*example\.(?:com|org|net)$/.test(domain) || /\.(?:example|test|invalid|localhost)$/.test(domain)) return "reserved for documentation (RFC 2606)";
      if (m.toLowerCase() === "git@github.com") return "GitHub's public SSH user, not a person";
    },
  },
  {
    rule: "workspace-link",
    pattern: /https?:\/\/[a-z0-9-]+\.slack\.com(?:\/[^\s)>\]"'`]*)?/gi,
    allow: (m) => {
      const host = new URL(m).hostname.toLowerCase();
      if (host === "api.slack.com") return "Slack's public API documentation";
      if (host === "example.slack.com") return "fictional workspace used in examples";
    },
  },
  {
    rule: "workspace-link",
    pattern: /\b[a-z0-9-]+\.slack\.com\/(?:archives|client|team)\/[^\s)>\]"'`]*/gi,
    allow: (m) => (m.toLowerCase().startsWith("example.slack.com/") ? "fictional workspace used in examples" : undefined),
  },
  {
    rule: "member-or-channel-id",
    // Slack-style identifiers: a type letter and 8-12 uppercase letters and digits, mixing both.
    pattern: /\b[UWCGTDBF][A-Z0-9]{8,12}\b/g,
    allow: (m) => {
      const tail = m.slice(1);
      if ((tail.match(/[0-9]/g) ?? []).length < 2 || (tail.match(/[A-Z]/g) ?? []).length < 2) return "not identifier-shaped: a word or a number";
      if (m.includes("EXAMPLE")) return "fictional identifier used in examples";
    },
  },
  {
    rule: "local-path",
    pattern: /(?:\/home\/|\/Users\/|\b[A-Za-z]:\\Users\\)[A-Za-z0-9._-]+/g,
    allow: (m) => {
      const name = m.split(/[\\/]/).pop().toLowerCase();
      if (["runner", "user", "username", "you", "example"].includes(name)) return "a placeholder or CI account, not a person";
    },
  },
  { rule: "credential", pattern: /\bxox[abposr]-[A-Za-z0-9-]{10,}/g },
  { rule: "credential", pattern: /\bxapp-[A-Za-z0-9-]{10,}/g },
  { rule: "credential", pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}/g },
  { rule: "credential", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}/g },
  { rule: "credential", pattern: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g },
  { rule: "credential", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { rule: "credential", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  {
    rule: "credential",
    pattern: /\b(?:api[_-]?key|secret|token|password|passwd)\b["']?\s*[:=]\s*["']?[A-Za-z0-9/_+=.-]{16,}/gi,
  },
];

/** Path rules: local configuration, logs and conversation exports never travel. */
const PATHS = [
  { rule: "private-config", pattern: /(?:^|\/)\.env(?:\.(?!example$)[^/]+)?$/ },
  { rule: "private-config", pattern: /(?:^|\/)\.npmrc$/ },
  { rule: "private-config", pattern: /(?:^|\/)[^/]+\.local(?:\.[^/]+)?$/ },
  { rule: "private-config", pattern: /(?:^|\/)\.(?:claude|codex)\// },
  { rule: "private-config", pattern: /(?:^|\/)(?:id_rsa|id_ed25519)[^/]*$|\.(?:pem|key|p12)$/ },
  { rule: "log", pattern: /\.log$/ },
  { rule: "conversation-export", pattern: /\.jsonl$|(?:^|\/)(?:conversations?|transcripts?|chat-export)[^/]*\.(?:json|md|txt|html)$/i },
];

/** A masked rendering: enough to locate the value, never enough to reproduce it. */
export function mask(value) {
  return value.length <= 4 ? "*".repeat(value.length) : `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 2, 8))} (${value.length} chars)`;
}

/**
 * Scan files for private material.
 * @param {Record<string, string | Uint8Array>} files contents, keyed by `/`-separated path
 * @param {{ local?: string[] }} options literals from an untracked local list, matched without case
 * @returns {{ rule: string, path: string, line?: number, masked: string }[]}
 */
export function scan(files, { local = [] } = {}) {
  const findings = [];
  const literals = local.map((l) => l.trim()).filter(Boolean);
  for (const path of Object.keys(files).sort()) {
    for (const { rule, pattern } of PATHS) if (pattern.test(path)) findings.push({ rule, path, masked: mask(path.split("/").pop()) });
    const bytes = files[path];
    const text = typeof bytes === "string" ? bytes : Buffer.from(bytes).toString("utf8");
    if (text.includes("\0")) continue; // binary: path rules only
    const lines = text.split("\n");
    lines.forEach((content, i) => {
      for (const { rule, pattern, allow } of RULES) {
        for (const m of content.matchAll(pattern)) {
          if (!allow?.(m[0])) findings.push({ rule, path, line: i + 1, masked: mask(m[0]) });
        }
      }
      const lower = content.toLowerCase();
      for (const l of literals) if (lower.includes(l.toLowerCase())) findings.push({ rule: "local", path, line: i + 1, masked: mask(l) });
    });
  }
  return findings;
}

/** The files packed in a .tgz, by path inside the package, read from its bytes. */
export function unpack(bytes) {
  const tar = gunzipSync(bytes);
  const files = {};
  for (let at = 0; at + 512 <= tar.length; ) {
    const header = tar.subarray(at, at + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0[\s\S]*$/, "");
    const size = parseInt(field(124, 12).trim() || "0", 8);
    const prefix = field(345, 155);
    const name = prefix ? `${prefix}/${field(0, 100)}` : field(0, 100);
    if (["0", ""].includes(field(156, 1))) files[name] = tar.subarray(at + 512, at + 512 + size);
    at += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

/** Read the local list, refusing one that lives inside this repository. */
export function localList(path) {
  const full = resolve(path);
  const inside = relative(REPO, full);
  if (!inside.startsWith("..") && !isAbsolute(inside)) throw new Error("the local list must live outside this repository: it is never committed");
  if (!existsSync(full)) throw new Error("no local list at the given path");
  return readFileSync(full, "utf8").split("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refuse = (message) => {
    console.error(message);
    process.exit(2);
  };
  const args = process.argv.slice(2);
  let local = process.env.KAAL_PRIVACY_LOCAL ? [process.env.KAAL_PRIVACY_LOCAL] : [];
  const dirs = [];
  const packs = [];
  let paths = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--paths") paths = true;
    else if (args[i] === "--local") local = [args[++i] ?? refuse("--local needs a file")];
    else if (args[i] === "--pack") packs.push(args[++i] ?? refuse("--pack needs a tarball"));
    else if (args[i].startsWith("--")) refuse(`unknown option ${args[i]}`);
    else dirs.push(args[i]);
  }
  if (!dirs.length && !packs.length && !paths) refuse("usage: check.mjs [--local <file>] [--paths] [--pack <tarball>]... [<dir>]...");
  let literals = [];
  try {
    if (local.length) literals = localList(local[0]);
  } catch (e) {
    refuse(e.message);
  }
  const { read } = await import("kaal-hosting");
  const findings = [];
  let count = 0;
  for (const dir of dirs) {
    // Hosting reads a missing directory as empty; a scan of nothing must not pass.
    if (!statSync(resolve(dir), { throwIfNoEntry: false })?.isDirectory()) refuse(`${dir} is not a directory`);
    const files = await read(resolve(dir)).catch((e) => refuse(`${dir}: ${e.message}`));
    const kept = Object.fromEntries(Object.entries(files).filter(([p]) => !/(?:^|\/)(?:node_modules|dist|dist-test|\.git)\//.test(p)));
    count += Object.keys(kept).length;
    findings.push(...scan(kept, { local: literals }).map((f) => ({ ...f, path: `${dir}/${f.path}` })));
  }
  if (paths) {
    const input = readFileSync(0, "utf8");
    const files = {};
    for (const p of input.split(input.includes("\0") ? "\0" : "\n").filter(Boolean)) {
      if (p.split("/").some((s) => s === "" || s === "." || s === "..")) refuse(`not a relative path: ${p}`);
      try {
        files[p] = readFileSync(p);
      } catch (e) {
        refuse(`${p}: ${e.code ?? e.message}`);
      }
    }
    count += Object.keys(files).length;
    findings.push(...scan(files, { local: literals }));
  }
  for (const pack of packs) {
    const files = unpack(readFileSync(pack));
    count += Object.keys(files).length;
    findings.push(...scan(files, { local: literals }).map((f) => ({ ...f, path: `${pack}!${f.path}` })));
  }
  for (const f of findings) console.error(`${f.rule}: ${f.path}${f.line ? `:${f.line}` : ""}: ${f.masked}`);
  if (!findings.length) console.log(`ok: ${count} files scanned, nothing found`);
  // Let the output drain: process.exit could cut off what is still buffered.
  process.exitCode = findings.length ? 1 : 0;
}

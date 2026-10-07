#!/usr/bin/env node
// collect begin <kaal-dir> [--date YYYY-MM-DD]   (today in UTC unless given)
// collect reached <kaal-dir> <collection> --client <name> --adapter <text> --from <dir>
// collect unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>
// collect check <kaal-dir> <collection>
// The record of what an agent collected from KAAL clients, and of what it
// tried and could not reach. A collection is <kaal-dir>/collections/YY/MM/DD/CC/
// with one directory per attempted client:
//
//   <client>/reach.md             the attempt's outcome and evidence
//   <client>/carriers/<path>      the exposed carriers, byte for byte (reached only)
//
// The script reaches nothing. What a client exposes is shown to the agent by
// whatever means it has, which this script never sees, and the agent gives it
// the directory those files are in. It reads only that directory, refuses
// anything in it that is not a plain file, interprets nothing it copies, keeps
// no list of clients, and never replaces what it has written.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COLLECTION = /^collections\/\d\d\/\d\d\/\d\d\/\d\d$/;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const usage = () => fail("usage: collect begin|reached|unreached|check <kaal-dir> ...", 2);

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

/** Flags `--name value`, each at most once, and the positionals that remain. */
function parse(args, allowed) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) rest.push(args[i]);
    else {
      const name = args[i].slice(2);
      if (!allowed.includes(name) || name in flags || i + 1 >= args.length) usage();
      flags[name] = args[++i];
    }
  }
  return { flags, rest };
}

const oneLine = (label, text) => {
  const value = String(text ?? "").trim();
  if (value === "" || /[\u0000-\u001f\u007f]/.test(value)) fail(`${label} must be one non-empty line of text`);
  return value;
};

const [command, ...args] = process.argv.slice(2);
if (command === "begin") begin();
else if (command === "reached") reached();
else if (command === "unreached") unreached();
else if (command === "check") check();
else usage();

function begin() {
  const { flags, rest } = parse(args, ["date"]);
  if (rest.length !== 1) usage();
  const date = flags.date ?? new Date().toISOString().slice(0, 10);
  const parsed = /^\d{4}-\d\d-\d\d$/.test(date) ? new Date(`${date}T00:00:00Z`) : undefined;
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < "2000-01-01" || date > "2099-12-31") fail("--date is a real date from 2000-01-01 to 2099-12-31, as YYYY-MM-DD");
  const [y, m, d] = date.split("-");
  const day = join(rest[0], "collections", y.slice(2), m, d);
  mkdirSync(day, { recursive: true });
  for (;;) {
    const taken = readdirSync(day).filter((n) => /^\d\d$/.test(n)).map(Number);
    const next = Math.max(0, ...taken) + 1;
    if (next > 99) fail(`no collection number is left for ${date}: 99 is the highest`);
    const cc = String(next).padStart(2, "0");
    try {
      mkdirSync(join(day, cc));
    } catch (error) {
      if (error.code === "EEXIST") continue; // another collection took it first: take the next, never reuse
      throw error;
    }
    console.log(`collections/${y.slice(2)}/${m}/${d}/${cc}`);
    return;
  }
}

/** The collection directory, which must already exist. */
function collection(kaalDir, relative) {
  if (!COLLECTION.test(relative ?? "")) fail("the collection is a path of the form collections/YY/MM/DD/CC, as `begin` prints it");
  const dir = join(kaalDir, relative);
  if (!existsSync(dir) || !lstatSync(dir).isDirectory()) fail(`no such collection: ${relative}`);
  return dir;
}

function clientDir(dir, name) {
  if (!NAME.test(name ?? "") || name.length > 64) fail("the client name is 1-64 lowercase letters, digits and single hyphens");
  const target = join(dir, name);
  if (existsSync(target)) fail(`${name} is already recorded in this collection, and a record is never replaced`);
  return target;
}

/** The record of one attempt, in its one form. `carriers` is [[sha, path]] for a reached client. */
function render(client, outcome, adapter, reason, carriers) {
  const lines = [`# ${client}`, "", outcome, `adapter: ${adapter}`];
  if (outcome === "unreached") lines.push(`reason: ${reason}`);
  if (outcome === "reached" && carriers.length > 0) lines.push("", ...carriers.map(([sha, path]) => `${sha}  ${path}`));
  return `${lines.join("\n")}\n`;
}

function write(target, record, files) {
  try {
    mkdirSync(target);
  } catch (error) {
    fail(error.code === "EEXIST" ? `${target.split("/").pop()} is already recorded in this collection, and a record is never replaced` : `nothing was recorded: ${error.message}`);
  }
  // From here the directory is this attempt's own, so undoing it removes only what it wrote.
  try {
    writeFileSync(join(target, "reach.md"), record, { flag: "wx" });
    for (const [path, bytes] of files) {
      mkdirSync(dirname(join(target, "carriers", path)), { recursive: true });
      writeFileSync(join(target, "carriers", path), bytes, { flag: "wx" });
    }
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    fail(`nothing was recorded: ${error.message}`);
  }
}

function reached() {
  const { flags, rest } = parse(args, ["client", "adapter", "from"]);
  if (rest.length !== 2 || !flags.from) usage();
  const dir = collection(rest[0], rest[1]);
  const target = clientDir(dir, flags.client);
  const adapter = oneLine("--adapter", flags.adapter);
  if (!existsSync(flags.from) || !lstatSync(flags.from).isDirectory()) fail("--from must be a directory holding what the client exposes");
  const found = [];
  const seen = new Set();
  const walk = (directory, prefix) => {
    for (const entry of readdirSync(directory).sort()) {
      const path = prefix === "" ? entry : `${prefix}/${entry}`;
      const full = join(directory, entry);
      const kind = lstatSync(full);
      if (/[\\\u0000-\u001f\u007f]/.test(entry) || entry !== entry.normalize("NFC")) fail(`refused: ${path} has a name that is not stated the same on every platform`);
      if (/^\.git/i.test(entry)) fail(`refused: ${path} is a name Git cannot carry faithfully, so the collection could not be kept as recorded`);
      if (seen.has(path.toLowerCase())) fail(`refused: ${path} differs only by case from another exposed path`);
      seen.add(path.toLowerCase());
      if (kind.isDirectory()) walk(full, path);
      else if (kind.isFile()) found.push([path, readFileSync(full)]);
      else fail(`refused: ${path} is not a plain file, and only plain files are collected`);
    }
  };
  walk(flags.from, "");
  const carriers = found.map(([path, bytes]) => [sha256(bytes), path]);
  write(target, render(flags.client, "reached", adapter, "", carriers), found);
  console.log(`${flags.client}: reached, ${found.length} carrier${found.length === 1 ? "" : "s"}`);
}

function unreached() {
  const { flags, rest } = parse(args, ["client", "adapter", "reason"]);
  if (rest.length !== 2) usage();
  const dir = collection(rest[0], rest[1]);
  const target = clientDir(dir, flags.client);
  write(target, render(flags.client, "unreached", oneLine("--adapter", flags.adapter), oneLine("--reason", flags.reason), []), []);
  console.log(`${flags.client}: unreached`);
}

function check() {
  if (args.length !== 2) usage();
  const dir = collection(args[0], args[1]);
  const problems = [];
  const clients = readdirSync(dir).sort();
  for (const client of clients) {
    const base = join(dir, client);
    const record = join(base, "reach.md");
    if (!NAME.test(client) || !lstatSync(base).isDirectory() || !existsSync(record) || !lstatSync(record).isFile()) {
      problems.push(`${client}: is not the record of an attempt`);
      continue;
    }
    const text = readFileSync(record, "utf8");
    const lines = text.split("\n");
    const outcome = lines[2];
    const adapter = /^adapter: (.+)$/.exec(lines[3] ?? "")?.[1];
    const reason = outcome === "unreached" ? /^reason: (.+)$/.exec(lines[4] ?? "")?.[1] : "";
    const carriers = outcome === "reached" ? lines.slice(5, -1).map((line) => /^([0-9a-f]{64})  (.+)$/.exec(line)?.slice(1)) : [];
    if ((outcome !== "reached" && outcome !== "unreached") || adapter === undefined || reason === undefined || carriers.some((c) => !c) || render(client, outcome, adapter, reason, carriers) !== text) {
      problems.push(`${client}: reach.md is not in the form this capability writes`);
      continue;
    }
    const listed = new Map(carriers.map(([sha, path]) => [path, sha]));
    if (listed.size !== carriers.length) problems.push(`${client}: a carrier is recorded twice`);
    for (const entry of readdirSync(base)) if (entry !== "reach.md" && entry !== "carriers") problems.push(`${client}: ${entry} is not part of the record`);
    if (existsSync(join(base, "carriers")) && !lstatSync(join(base, "carriers")).isDirectory()) {
      problems.push(`${client}: carriers is not a directory`);
      continue;
    }
    const present = [];
    const walk = (directory, prefix) => {
      if (!existsSync(directory)) return;
      for (const entry of readdirSync(directory)) {
        const path = prefix === "" ? entry : `${prefix}/${entry}`;
        const kind = lstatSync(join(directory, entry));
        if (kind.isDirectory()) walk(join(directory, entry), path);
        else if (kind.isFile()) present.push(path);
        else problems.push(`${client}: ${path} is not a plain file`);
      }
    };
    walk(join(base, "carriers"), "");
    for (const path of present) if (!listed.has(path)) problems.push(`${client}: ${path} is collected but not recorded`);
    for (const [path, sha] of listed) {
      if (!present.includes(path)) problems.push(`${client}: ${path} is recorded but missing`);
      else if (sha256(readFileSync(join(base, "carriers", path))) !== sha) problems.push(`${client}: ${path} no longer matches its recorded identity`);
    }
    if (outcome === "unreached" && existsSync(join(base, "carriers"))) problems.push(`${client}: is unreached but holds carriers`);
  }
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) process.exit(1);
  console.log(`${clients.length} attempt${clients.length === 1 ? "" : "s"}, every carrier matches`);
}

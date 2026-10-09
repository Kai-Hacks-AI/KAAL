#!/usr/bin/env node
// collect begin <kaal-dir> [--date YYYY-MM-DD]   (today in UTC unless given)
// collect reached <kaal-dir> <collection> --client <name> --adapter <text> --from <client-kaal-dir>
// collect unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>
// collect check <kaal-dir> <collection>
// collect reached|unreached ... --keep [--continues]   also keep the attempt as a sighting and its carriers
// collect check-record <kaal-dir>                       check the kept sightings and stored carriers
// The record of what an agent collected from KAAL clients, and of what it
// tried and could not reach. A collection is <kaal-dir>/collections/YY/MM/DD/CC/
// with one directory per attempted client:
//
//   <client>/reach.md             the attempt's outcome and evidence
//   <client>/carriers/<path>      the exposed carriers, byte for byte, at the path
//                                 they were carried at within the client's KAAL directory
//                                 (reached only)
//
// The script reaches nothing. What a client exposes is shown to the agent by
// whatever means it has, which this script never sees, and the agent gives it
// the directory it made of the client's KAAL directory. Of that directory the
// script reads only the places where clients carry what they address to KAAL
// (CARRIED_AT) and nothing else of it, refuses anything there that is not a
// plain file, interprets nothing it copies, keeps no list of clients, and never
// replaces what it has written.
//
// With --keep an attempt is also kept in the same directory, beside collections/:
//
//   clients/<client>/sightings/YY/MM/DD/CC.md   the attempt, naming its collection
//   incidents|requests/<client>/<sha256>.md     each carrier, byte for byte, once per client and hash
//
// A client exists there exactly when it has a sighting. The first sighting of a
// name is its founding one; a later one is refused unless --continues asserts it
// is the same client, and is then marked `continues: asserted`. The assertion is
// the collector's and is not proof of identity. Equal bytes are stored once; that
// says nothing about whether they came from one communication or several.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Where, within a client's KAAL directory, communication addressed to KAAL is carried. */
const CARRIED_AT = ["incidents", "requests"];
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COLLECTION = /^collections\/\d\d\/\d\d\/\d\d\/\d\d$/;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** Whether anything is at `path`, a dangling link included; `existsSync` follows links and says no. */
const anythingAt = (path) => {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
};
const usage = () => fail("usage: collect begin|reached|unreached|check <kaal-dir> ...", 2);

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

/** Flags `--name value`, each at most once, and the positionals that remain. */
function parse(args, allowed, switches = []) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) rest.push(args[i]);
    else {
      const name = args[i].slice(2);
      if (switches.includes(name)) {
        if (name in flags) usage();
        flags[name] = true;
      } else {
        if (!allowed.includes(name) || name in flags || i + 1 >= args.length) usage();
        flags[name] = args[++i];
      }
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
else if (command === "check-record") checkRecord();
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

/** The attempt a record states, or undefined when it is not in the one form this capability writes. */
function readAttempt(client, text) {
  const lines = text.split("\n");
  const outcome = lines[2];
  const adapter = /^adapter: (.+)$/.exec(lines[3] ?? "")?.[1];
  const reason = outcome === "unreached" ? /^reason: (.+)$/.exec(lines[4] ?? "")?.[1] : "";
  const carriers = outcome === "reached" ? lines.slice(5, -1).map((line) => /^([0-9a-f]{64})  (.+)$/.exec(line)?.slice(1)) : [];
  if ((outcome !== "reached" && outcome !== "unreached") || adapter === undefined || reason === undefined || carriers.some((c) => !c) || render(client, outcome, adapter, reason, carriers) !== text) return undefined;
  return { outcome, adapter, reason, carriers };
}

/** A sighting: the attempt in its one form, naming its collection, and whether continuity was asserted. */
function renderSighting(collection, client, outcome, adapter, reason, carriers, continues) {
  const lines = render(client, outcome, adapter, reason, carriers).split("\n");
  lines.splice(2, 0, `collection: ${collection}`);
  if (continues) lines.splice(outcome === "unreached" ? 6 : 5, 0, "continues: asserted");
  return lines.join("\n");
}

function readSighting(client, text) {
  const lines = text.split("\n");
  const collection = /^collection: (collections\/\d\d\/\d\d\/\d\d\/\d\d)$/.exec(lines[2] ?? "")?.[1];
  if (!collection) return undefined;
  lines.splice(2, 1);
  const at = lines[2] === "unreached" ? 5 : 4;
  const continues = lines[at] === "continues: asserted";
  if (continues) lines.splice(at, 1);
  const attempt = readAttempt(client, lines.join("\n"));
  if (!attempt) return undefined;
  const { outcome, adapter, reason, carriers } = attempt;
  if (renderSighting(collection, client, outcome, adapter, reason, carriers, continues) !== text) return undefined;
  return { collection, continues, ...attempt };
}

/** Whether the client has any sighting in this record. */
function hasSighting(root, client) {
  const dir = join(root, "clients", client, "sightings");
  if (!anythingAt(dir)) return false;
  return readdirSync(dir, { recursive: true }).some((entry) => lstatSync(join(dir, entry)).isFile());
}

/** Refuses a destination below `root` whose existing directory components are not plain directories, so nothing is ever written through a link. `parts` are the directory components below the record, however `root` is spelled. */
function plainDestination(root, parts) {
  let current = root;
  for (const part of parts) {
    current = join(current, part);
    if (anythingAt(current) && !lstatSync(current).isDirectory()) fail(`refused: ${parts.slice(0, parts.indexOf(part) + 1).join("/")} is not a plain directory of this record`);
  }
}

/** Everything --keep would write for this attempt, after refusing, before writing anything, what it must not. */
function planKeep(root, collection, client, flags, text, found) {
  if (flags.continues && !flags.keep) fail("--continues applies only with --keep", 2);
  if (!flags.keep) return undefined;
  const known = hasSighting(root, client);
  if (known && !flags.continues) fail(`${client} already has sightings in this record: pass --continues to assert that it is the same client, which is an assertion and not proof`);
  if (!known && flags.continues) fail(`--continues asserts continuity with a client already recorded, and ${client} has no sighting in this record`);
  const day = collection.slice("collections/".length).split("/");
  const sighting = join(root, "clients", client, "sightings", ...day.slice(0, 3), `${day[3]}.md`);
  plainDestination(root, ["clients", client, "sightings", ...day.slice(0, 3)]);
  if (anythingAt(sighting)) fail(`refused: ${client} already has a sighting for ${collection}`);
  const stored = [];
  for (const [path, bytes] of found) {
    const target = join(root, path.split("/")[0], client, `${sha256(bytes)}.md`);
    plainDestination(root, [path.split("/")[0], client]);
    if (anythingAt(target)) {
      if (!lstatSync(target).isFile() || !readFileSync(target).equals(bytes)) fail(`refused: the stored carrier for ${path} is not the bytes it is named for`);
    } else if (!stored.some(([t]) => t === target)) stored.push([target, bytes]);
  }
  return { sighting, text, stored };
}

function keep(plan, collectionClient) {
  const made = [];
  try {
    for (const [target, bytes] of [[plan.sighting, plan.text], ...plan.stored]) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes, { flag: "wx" });
      made.push(target);
    }
  } catch (error) {
    for (const target of made) rmSync(target, { force: true });
    rmSync(collectionClient, { recursive: true, force: true });
    fail(`nothing was recorded: ${error.message}`);
  }
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
  const { flags, rest } = parse(args, ["client", "adapter", "from"], ["keep", "continues"]);
  if (rest.length !== 2 || !flags.from) usage();
  const dir = collection(rest[0], rest[1]);
  const target = clientDir(dir, flags.client);
  const adapter = oneLine("--adapter", flags.adapter);
  if (!existsSync(flags.from) || !lstatSync(flags.from).isDirectory()) fail("--from must be the directory made of the client's KAAL directory");
  const found = [];
  const seen = new Set();
  const walk = (directory, prefix) => {
    for (const entry of readdirSync(directory).sort()) {
      const path = `${prefix}/${entry}`;
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
  for (const place of CARRIED_AT) {
    const full = join(flags.from, place);
    if (!anythingAt(full)) continue;
    if (!lstatSync(full).isDirectory()) fail(`refused: ${place} is not a plain directory`);
    walk(full, place);
  }
  const carriers = found.map(([path, bytes]) => [sha256(bytes), path]);
  const plan = planKeep(rest[0], rest[1], flags.client, flags, renderSighting(rest[1], flags.client, "reached", adapter, "", carriers, flags.continues), found);
  write(target, render(flags.client, "reached", adapter, "", carriers), found);
  if (plan) keep(plan, target);
  console.log(`${flags.client}: reached, ${found.length} carrier${found.length === 1 ? "" : "s"}${plan ? `, kept as a sighting with ${plan.stored.length} new stored` : ""}`);
}

function unreached() {
  const { flags, rest } = parse(args, ["client", "adapter", "reason"], ["keep", "continues"]);
  if (rest.length !== 2) usage();
  const dir = collection(rest[0], rest[1]);
  const target = clientDir(dir, flags.client);
  const adapter = oneLine("--adapter", flags.adapter);
  const reason = oneLine("--reason", flags.reason);
  const plan = planKeep(rest[0], rest[1], flags.client, flags, renderSighting(rest[1], flags.client, "unreached", adapter, reason, [], flags.continues), []);
  write(target, render(flags.client, "unreached", adapter, reason, []), []);
  if (plan) keep(plan, target);
  console.log(`${flags.client}: unreached${plan ? ", kept as a sighting" : ""}`);
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
    const attempt = readAttempt(client, readFileSync(record, "utf8"));
    if (!attempt) {
      problems.push(`${client}: reach.md is not in the form this capability writes`);
      continue;
    }
    const { outcome, carriers } = attempt;
    const listed = new Map(carriers.map(([sha, path]) => [path, sha]));
    if (listed.size !== carriers.length) problems.push(`${client}: a carrier is recorded twice`);
    for (const entry of readdirSync(base)) if (entry !== "reach.md" && entry !== "carriers") problems.push(`${client}: ${entry} is not part of the record`);
    if (anythingAt(join(base, "carriers")) && !lstatSync(join(base, "carriers")).isDirectory()) {
      problems.push(`${client}: carriers is not a directory`);
      continue;
    }
    const present = [];
    const walk = (directory, prefix) => {
      if (!anythingAt(directory)) return;
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
    if (outcome === "unreached" && anythingAt(join(base, "carriers"))) problems.push(`${client}: is unreached but holds carriers`);
  }
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) process.exit(1);
  console.log(`${clients.length} attempt${clients.length === 1 ? "" : "s"}, every carrier matches`);
}

function checkRecord() {
  if (args.length !== 1) usage();
  const root = args[0];
  const problems = [];
  const clientsDir = join(root, "clients");
  const clients = anythingAt(clientsDir) ? readdirSync(clientsDir).sort() : [];
  const referenced = new Set();
  let sightings = 0;
  for (const client of clients) {
    const base = join(clientsDir, client);
    if (!NAME.test(client) || !lstatSync(base).isDirectory()) {
      problems.push(`${client}: is not the record of a client`);
      continue;
    }
    for (const entry of readdirSync(base)) if (entry !== "sightings") problems.push(`${client}: ${entry} is not part of the record`);
    const files = [];
    const walk = (directory, prefix) => {
      if (!anythingAt(directory)) return;
      for (const entry of readdirSync(directory)) {
        const path = prefix === "" ? entry : `${prefix}/${entry}`;
        const kind = lstatSync(join(directory, entry));
        if (kind.isDirectory()) walk(join(directory, entry), path);
        else if (kind.isFile()) files.push(path);
        else problems.push(`${client}: sightings/${path} is not a plain file`);
      }
    };
    walk(join(base, "sightings"), "");
    let founding = 0;
    for (const path of files.sort()) {
      const address = /^(\d\d)\/(\d\d)\/(\d\d)\/(\d\d)\.md$/.exec(path);
      if (!address) {
        problems.push(`${client}: sightings/${path} is not a sighting address`);
        continue;
      }
      sightings++;
      const named = `collections/${address[1]}/${address[2]}/${address[3]}/${address[4]}`;
      const text = readFileSync(join(base, "sightings", path), "utf8");
      const sighting = readSighting(client, text);
      if (!sighting || sighting.collection !== named) {
        problems.push(`${client}: sightings/${path} is not in the form this capability writes`);
        continue;
      }
      if (!sighting.continues) founding++;
      const reach = join(root, named, client, "reach.md");
      const attempt = anythingAt(reach) && lstatSync(reach).isFile() ? readAttempt(client, readFileSync(reach, "utf8")) : undefined;
      if (!attempt) problems.push(`${client}: sightings/${path} names ${named}, which holds no record of this attempt`);
      else if (renderSighting(named, client, attempt.outcome, attempt.adapter, attempt.reason, attempt.carriers, sighting.continues) !== text) problems.push(`${client}: sightings/${path} does not match the attempt it names`);
      for (const [sha, carried] of sighting.carriers) {
        const key = `${carried.split("/")[0]}/${client}/${sha}.md`;
        referenced.add(key);
        const stored = join(root, key);
        if (!anythingAt(stored) || !lstatSync(stored).isFile()) problems.push(`${client}: ${carried} (sightings/${path}) has no stored carrier`);
        else if (sha256(readFileSync(stored)) !== sha) problems.push(`${client}: ${key} no longer matches its name`);
      }
    }
    if (founding !== 1) problems.push(`${client}: has ${founding} founding sightings, and exactly one is required`);
  }
  // Stored carriers are found by what they are, not by the client records that survive. A caller's
  // Record may also hold the locally authored dated carriers (<place>/YY/MM/DD/CC.md); those hold no
  // <sha256>.md file directly below a name, so they are not stored carriers.
  for (const place of CARRIED_AT) {
    const placeDir = join(root, place);
    if (!anythingAt(placeDir) || !lstatSync(placeDir).isDirectory()) continue;
    for (const client of readdirSync(placeDir).sort()) {
      const dir = join(placeDir, client);
      if (!NAME.test(client) || !lstatSync(dir).isDirectory()) continue;
      const entries = readdirSync(dir);
      if (!clients.includes(client) && !entries.some((entry) => /^[0-9a-f]{64}\.md$/.test(entry))) continue;
      for (const entry of entries) {
        const key = `${place}/${client}/${entry}`;
        if (!referenced.has(key)) problems.push(`${client}: ${key} is stored but no sighting lists it${clients.includes(client) ? "" : ", and there is no record of this client"}`);
      }
    }
  }
  for (const problem of new Set(problems)) console.error(problem);
  if (problems.length > 0) process.exit(1);
  console.log(`${clients.length} client record${clients.length === 1 ? "" : "s"}, ${sightings} sighting${sightings === 1 ? "" : "s"}, every stored carrier matches`);
}

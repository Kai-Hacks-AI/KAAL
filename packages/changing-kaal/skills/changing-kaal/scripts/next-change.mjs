#!/usr/bin/env node
// next-change [--date YYYY-MM-DD] <kaal-dir> <name>
// Allocates the next change record, changes/<name>/YY/MM/DD/CC/, inside a
// KAAL directory: CC is the number after the highest existing two-digit
// sequence for that name and date (01..99), gaps are never reused, and it
// refuses when 99 is taken. It creates the directory (so the allocation is
// held) and prints its path relative to the KAAL directory. The date is today in UTC
// unless given. It writes nothing else.
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
let date;
if (args[0] === "--date") date = args.splice(0, 2)[1];
const [kaalDir, name, ...extra] = args;
if (!kaalDir || !name || extra.length > 0) {
  console.error("usage: next-change [--date YYYY-MM-DD] <kaal-dir> <name>");
  process.exit(2);
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail("the name is lowercase letters, digits and single hyphens");
const day = date ?? new Date().toISOString().slice(0, 10);
const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
if (!parts || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) fail("the date is a real date, YYYY-MM-DD");
const base = join(kaalDir, "changes", name, parts[1].slice(2), parts[2], parts[3]);
const taken = existsSync(base) ? readdirSync(base).filter((d) => /^(0[1-9]|[1-9][0-9])$/.test(d)).map(Number) : [];
const next = Math.max(0, ...taken) + 1;
if (next > 99) fail(`changes/${name}/${parts[1].slice(2)}/${parts[2]}/${parts[3]}/ has no sequence left: 99 is taken`);
const cc = String(next).padStart(2, "0");
mkdirSync(join(base, cc), { recursive: true });
console.log(`changes/${name}/${parts[1].slice(2)}/${parts[2]}/${parts[3]}/${cc}/`);

function fail(message) {
  console.error(message);
  process.exit(1);
}

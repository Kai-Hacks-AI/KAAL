#!/usr/bin/env node
// The package lane (controls/F232): runs the Cases with testing's runner, judges them with judgeLane, prints held ids and findings.
// usage: lane.mjs [--root dir] [--register file] [test files…]. Exit 0 ok, 1 findings, 2 invalid input.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCases } from 'kaal-testing/run';
import { changesOf } from './lib/changes-of.mjs';
import { judgeLane } from './lib/judge-lane.mjs';

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
let root = pkg; let registerPath; const files = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--root') root = resolve(argv[++i] ?? '');
  else if (argv[i] === '--register') registerPath = resolve(argv[++i] ?? '');
  else files.push(argv[i]);
}
try {
  registerPath ??= join(root, 'test/plan-register.json');
  if (!existsSync(root)) throw new Error(`root ${root} does not exist`);
  const register = JSON.parse(readFileSync(registerPath, 'utf8'));
  const tests = files.length > 0 ? files : readdirSync(join(root, 'test')).filter((f) => /\.test\.mjs$/.test(f)).sort().map((f) => `test/${f}`);
  const entries = [];
  const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p); } else if (/\.(md|mjs)$/.test(e.name)) entries.push({ path: relative(root, p).split(sep).join('/'), text: readFileSync(p, 'utf8') }); } };
  for (const d of ['00-changes', '01-intent', '02-requirements']) if (existsSync(join(root, d))) walk(join(root, d));
  const changes = changesOf(entries);
  const report = await runCases({ files: tests, root });
  const result = judgeLane({ report, register, changes });
  const refs = new Map(register.expected.map((e) => [e.id, e.reference]));
  for (const id of result.held) console.log(`held (PLAN, observed RED): ${id} [${refs.get(id)}]`);
  for (const f of result.findings) console.log(`finding: ${f}`);
  console.log(`observed ${JSON.stringify(report.counts)}; held ${result.held.length}; findings ${result.findings.length}`);
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(`lane: ${error.message}`);
  process.exit(2);
}

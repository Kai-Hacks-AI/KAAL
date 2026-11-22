#!/usr/bin/env node
// Judges a capability folder against the layout template (references/package-layout.json).
// judgeLayout is pure: it reads a template and the tracked file paths of the folder, relative to the folder, and touches nothing.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const NUMBERED = /^\d\d-/;

export function judgeLayout(template, paths) {
  if (!template || !Array.isArray(template.folders)) return { verdict: 'UNKNOWN', findings: ['the template cannot be read'] };
  if (!Array.isArray(paths) || paths.length === 0) return { verdict: 'UNKNOWN', findings: ['the folder holds no tracked file'] };
  const findings = [];
  const top = new Set(paths.map((p) => p.split('/')[0]).filter((n, i) => paths[i].includes('/')));
  const known = new Map(template.folders.map((f) => [f.name, f]));
  for (const name of [...top].sort()) if (NUMBERED.test(name) && !known.has(name)) findings.push(`${name} is a numbered folder the layout does not have`);
  // Outside the specification: every tracked file at the root and every folder that the template does not name.
  const rootNames = (template.root ?? []).map((r) => r.name);
  const rootFile = (n) => rootNames.some((r) => r === n || (r.startsWith('*') && n.endsWith(r.slice(1))));
  const topFiles = paths.filter((p) => !p.includes('/'));
  for (const n of [...new Set(topFiles)].sort()) if (!rootFile(n)) findings.push(`${n} is a file the layout does not have`);
  for (const name of [...top].sort()) if (!NUMBERED.test(name) && !known.has(name)) findings.push(`${name} is a folder the layout does not have`);
  // Inside the specification but missing: what the template marks required.
  for (const r of template.root ?? []) if (r.required && !topFiles.includes(r.name)) findings.push(`${r.name} is missing`);
  for (const f of template.folders) if (f.required && !top.has(f.name)) findings.push(`${f.name} is missing`);
  for (const f of template.folders) {
    if (!top.has(f.name)) continue;
    const under = paths.filter((p) => p.startsWith(`${f.name}/`)).map((p) => p.slice(f.name.length + 1));
    if (f.name === 'dist') findings.push('dist is committed');
    if (f.verifiedBy && !under.some((p) => p.startsWith(`${f.verifiedBy}/`))) findings.push(`${f.name} holds no ${f.verifiedBy}`);
    if (f.closed) {
      for (const child of new Set(under.filter((p) => p.includes('/')).map((p) => p.split('/')[0]))) if (!f.children.includes(child)) findings.push(`${f.name} holds ${child}, which the layout does not have`);
    }
  }
  return { verdict: findings.length ? 'FAIL' : 'PASS', findings };
}

// The workspace folder (packages/) holds only packages, plus the two files the Owner named.
const WORKSPACE_FILES = ['AGENTS.md', 'README.md'];
export function judgeWorkspace(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return { verdict: 'UNKNOWN', findings: ['the folder holds no tracked file'] };
  const findings = [];
  for (const p of paths) {
    const [first, ...rest] = p.split('/');
    if (rest.length === 0) { if (!WORKSPACE_FILES.includes(first)) findings.push(`${first} is a file the workspace does not allow`); }
    else if (NUMBERED.test(first)) findings.push(`${first} is a numbered folder; the workspace holds only packages`);
  }
  const unique = [...new Set(findings)];
  return { verdict: unique.length ? 'FAIL' : 'PASS', findings: unique };
}

const CODE = { PASS: 0, FAIL: 1, UNKNOWN: 2 };
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const workspace = args[0] === '--workspace';
  const [templatePath, folder] = workspace ? [undefined, args[1]] : args;
  let result;
  try {
    if (workspace) {
      const paths = execFileSync('git', ['-C', folder, 'ls-files', '--', '.'], { encoding: 'utf8' }).split('\n').filter(Boolean);
      result = judgeWorkspace(paths);
    } else {
    const template = JSON.parse(readFileSync(templatePath ?? join(dirname(fileURLToPath(import.meta.url)), '../references/package-layout.json'), 'utf8'));
    const paths = execFileSync('git', ['-C', folder, 'ls-files', '--', '.'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    result = judgeLayout(template, paths);
    }
  } catch (e) {
    result = { verdict: 'UNKNOWN', findings: [`cannot judge: ${String(e.message).split('\n')[0]}`] };
  }
  console.log(`${result.verdict}${result.findings.length ? `: ${result.findings.join('; ')}` : ''}`);
  process.exit(CODE[result.verdict]);
}

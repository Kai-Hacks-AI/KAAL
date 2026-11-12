// A33 check-pr-body: the first check of verify Plan.
// Applies the body contract of A16 and adds the contamination rules of F13. Run by hand: node verify.mjs <body file>
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkPlanBody } from './check.mjs';

// A comment that carries attribution or metadata, never a hint of the template.
const METADATA = /attribution|claude|session|thread|requested by|generated|co-authored|https?:\/\/|[{}]/i;

export function verifyBody(body) {
  const result = checkPlanBody(body);
  if (typeof body !== 'string') return result;
  const problems = [...result.problems];
  const first = body.search(/^#{1,6}\s/m);
  for (const comment of body.matchAll(/<!--[\s\S]*?-->/g)) {
    if (first !== -1 && comment.index < first) problems.push('an HTML comment sits before the first chapter');
    else if (METADATA.test(comment[0])) problems.push('an HTML comment carries attribution or metadata');
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node verify.mjs <body file>'); process.exit(2); }
  const { ok, problems } = verifyBody(readFileSync(file, 'utf8'));
  console.log(ok ? 'PASS: the body is clean' : `FAIL:\n${problems.map((p) => `- ${p}`).join('\n')}`);
  process.exit(ok ? 0 : 1);
}

// The runner of verify Envelope (release/CTL11, release/C137): asks the judge of the envelope about one pull request and says what the flag does with the answer.
// It reads files and Git data only: the pull_request event payload, the text of `git log` of base..head, and the pull request templates of the BASE commit. It never runs the pull request.
//   node run-verify-envelope.mjs --event <event.json> --templates <folder of the base commit> [--log <git log file>]
// The log is made with: git log --format=%H%x1f%B%x1e <base>..<head>
// The flag is the variable KAAL_RELEASE_VERIFY_ENVELOPE handed in as KAAL_FLAG. It decides the exit code and nothing else: exactly `on` makes a FAIL or an UNKNOWN exit 1
// (advisory, no ruleset requires it); anything else exits 0 with the same verdict written (detective).
// Environment for the record: KAAL_PR, KAAL_MERGE_SHA, KAAL_RUN_ID. UNKNOWN never passes: an unreadable fact, an absent template or a template finding is UNKNOWN, not PASS.
import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyEnvelope } from './envelope.mjs';
import { readTemplates } from './templates.mjs';

// The facts of verifyEnvelope from the event payload and the text of the log. Without a log `commits` is absent, which the judge reports as not judged.
export const factsOf = ({ event, log }) => {
  const p = event.pull_request;
  const facts = { title: p.title, body: p.body ?? '', base: p.base.ref, head: p.head.ref };
  if (typeof log === 'string') facts.commits = log.split('\u001e').filter((x) => x.trim() !== '').map((x) => ({ message: x.split('\u001f').slice(1).join('\u001f').trim() }));
  return facts;
};

// The pull request template files of a folder, as readTemplates takes them: { path, text } with the path relative to the folder.
const PLACES = ['', '.github', 'docs'];
export function templateFiles(folder) {
  const files = [];
  for (const place of PLACES) {
    const dir = join(folder, place);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const rel = place ? `${place}/${name.name}` : name.name;
      if (name.isFile() && /^pull_request_template(\.[a-z0-9]+)?$/i.test(name.name)) files.push({ path: rel, text: readFileSync(join(folder, rel), 'utf8') });
      if (name.isDirectory() && /^pull_request_template$/i.test(name.name)) {
        for (const f of readdirSync(join(folder, rel), { withFileTypes: true })) if (f.isFile()) files.push({ path: `${rel}/${f.name}`, text: readFileSync(join(folder, rel, f.name), 'utf8') });
      }
    }
  }
  return files;
}

// The answer for facts and the templates found: a template finding keeps the answer from passing.
export function answerOf(facts, templates) {
  const { registry, findings } = readTemplates(templates);
  const answer = verifyEnvelope(facts, registry);
  const notJudged = [...answer.notJudged, ...findings.map((f) => `template: ${f}`)];
  const verdict = answer.problems.length > 0 ? 'FAIL' : notJudged.length > 0 ? 'UNKNOWN' : 'PASS';
  return { ...answer, notJudged, verdict, complete: notJudged.length === 0 };
}

export const exitCodeOf = (answer, flag) => (flag === 'on' && answer.verdict !== 'PASS' ? 1 : 0);

export const reportOf = (answer, flag) => {
  const live = flag === 'on';
  const note = answer.verdict === 'PASS' ? '' : live ? ' (advisory, not required: no ruleset makes this check required)' : ' (reported only: the flag is not on, the check passes)';
  const lines = [`${answer.verdict}: verify Envelope${answer.message ? `: ${answer.message}` : ''}${note}`];
  for (const p of answer.problems ?? []) lines.push(`- finding: ${p}`);
  for (const n of answer.notJudged ?? []) lines.push(`- not judged: ${n}`);
  return lines.join('\n');
};

// One record per run: the pull request, the merge result and the run come from the workflow; a missing one is null.
export const recordOf = ({ pr, merge, run, answer, type }) => ({ kind: 'run', pr: pr ?? null, merge: merge ?? null, run: run ?? null, verdict: answer.verdict, type: type ?? null });
export const evidenceLine = (record) => `envelope-evidence ${JSON.stringify(record)}`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const flag = process.env.KAAL_FLAG;
  let answer = { verdict: 'UNKNOWN', problems: [], notJudged: [], message: '' };
  let type;
  try {
    const eventFile = arg('--event'), templates = arg('--templates'), logFile = arg('--log');
    if (!eventFile || !templates) throw new Error('--event and --templates are required');
    const facts = factsOf({ event: JSON.parse(readFileSync(eventFile, 'utf8')), log: logFile && existsSync(logFile) ? readFileSync(logFile, 'utf8') : undefined });
    type = /^([A-Z][A-Z0-9_]*): /.exec(facts.title ?? '')?.[1];
    answer = answerOf(facts, templateFiles(templates));
  } catch (e) { answer = { verdict: 'UNKNOWN', problems: [], notJudged: [], message: String(e.message) }; }
  const report = reportOf(answer, flag);
  const record = evidenceLine(recordOf({ pr: Number(process.env.KAAL_PR) || null, merge: process.env.KAAL_MERGE_SHA || null, run: Number(process.env.KAAL_RUN_ID) || null, answer, type }));
  console.log(report);
  console.log(record);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n${record}\n`);
  process.exit(exitCodeOf(answer, flag));
}

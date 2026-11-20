// release/A26 adapter: the command Guard runs after the dependency analysis step of a GitHub job.
// It reads what the mechanism returned from the environment, asks the result interpreter (release/A25)
// to classify it, prints the record as one JSON line, and ends with the exit status Guard reads:
// 0 PASS, 1 FAIL, 2 UNKNOWN (cannot judge, which never passes).
//
// KAAL_ANALYZE_CONCLUSION          the conclusion of the mechanism's step, 'success' or 'failure'
// KAAL_ANALYZE_VULNERABLE_CHANGES  the mechanism's `vulnerable-changes` output, when it set one
import { pathToFileURL } from 'node:url';
import { interpret } from './interpreter.mjs';

const STATUS = { PASS: 0, FAIL: 1, UNKNOWN: 2 };

export function analyze(env) {
  const result = { conclusion: env.KAAL_ANALYZE_CONCLUSION, outputs: { vulnerableChanges: env.KAAL_ANALYZE_VULNERABLE_CHANGES } };
  const record = interpret(result);
  return { record, status: STATUS[record.outcome] ?? STATUS.UNKNOWN };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { record, status } = analyze(process.env);
  console.log(JSON.stringify(record));
  for (const f of record.findings) console.log(`${f.severity} ${f.package}@${f.version} ${f.advisory}`);
  console.log(`${record.control}: ${record.outcome}: ${record.reason}`);
  process.exit(status);
}

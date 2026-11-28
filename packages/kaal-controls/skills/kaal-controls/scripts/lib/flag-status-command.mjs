// The flag status command without the process: pure over the text it is given. It reads nothing and writes nothing.
import { parseFlags, flagSource, validateFlags, decideOutcome } from '../flags.mjs';
import { reportFlags, renderFlagStatus } from '../flag-status.mjs';

export function flagStatusCommand({ flagsText, controls, runs, title }) {
  const source = flagSource(flagsText === undefined ? [] : parseFlags(flagsText));
  const validation = validateFlags({ controls, source });
  const outcome = decideOutcome({ validation, runs: [] });
  const report = reportFlags({ controls, source, runs });
  return { markdown: renderFlagStatus({ title: title ?? 'Flag status', rows: report.rows, findings: report.findings }), outcome };
}

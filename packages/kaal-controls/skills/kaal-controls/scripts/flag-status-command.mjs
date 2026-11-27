#!/usr/bin/env node
// Prints the flag status report from the paths it is given: --flags (the flag file), --controls ([{id, type, places}]), --runs ({ id: { place: [runs] } }) and --title.
// The adopter reads the flag file at the right revision and hands the path over. This command names no platform and writes nothing.
// Exit: 0 report printed and configuration valid, 1 configuration failed (the unknown decision of controls/F224 item 7), 2 an input could not be read.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseFlags, flagSource, validateFlags, decideOutcome } from './flags.mjs';
import { reportFlags, renderFlagStatus } from './flag-status.mjs';

export function flagStatusCommand({ flagsText, controls, runs, title }) {
  const source = flagSource(flagsText === undefined ? [] : parseFlags(flagsText));
  const validation = validateFlags({ controls, source });
  const outcome = decideOutcome({ validation, runs: [] });
  const report = reportFlags({ controls, source, runs });
  return { markdown: renderFlagStatus({ title: title ?? 'Flag status', rows: report.rows, findings: report.findings }), outcome };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  const text = (p) => { try { return readFileSync(p, 'utf8'); } catch { throw new Error(`unreadable: ${p}`); } };
  try {
    const flagsText = a.flags ? text(a.flags) : undefined;
    const controls = JSON.parse(text(a.controls));
    const runs = a.runs ? JSON.parse(text(a.runs)) : {};
    const { markdown, outcome } = flagStatusCommand({ flagsText, controls, runs, title: a.title });
    console.log(markdown);
    if (outcome.outcome === 'CONFIG_FAILED') console.error(`CONFIG_FAILED: ${outcome.reasons.join(', ')}`);
    process.exit(outcome.exit);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}

#!/usr/bin/env node
// DEPRECATED shim: the command line of the flag status report, kept at this path for callers that read files themselves until they read through hosting.
// It is not published (package.json files). The library is lib/flag-status-command.mjs. Delete this file when its callers read through hosting.
// Prints the flag status report from the paths it is given: --flags (the flag file), --controls ([{id, type, places}]), --runs ({ id: { place: [runs] } }) and --title.
// Exit: 0 report printed and configuration valid, 1 configuration failed (an unknown decision), 2 an input could not be read.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { flagStatusCommand } from './lib/flag-status-command.mjs';

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

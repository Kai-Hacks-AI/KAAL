// Offline, read-only report. Every host operation goes through Hosting.
import { readFile } from 'kaal-hosting';
import { replayHistory } from './replay.mjs';
const [file, instant] = process.argv.slice(2);
try {
  if (!file || !instant) throw new Error('usage: replay-cli.mjs <captured-actions.json> <ISO-time>');
  const capture = JSON.parse((await readFile(file)).toString('utf8'));
  const report = replayHistory(capture.subject, capture, Date.parse(instant));
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  // History is not an authorized full-assurance verdict. Never exit as verified.
  process.exitCode = 2;
} catch (e) {
  process.stderr.write(`cannot replay: ${e.message}\n`);
  process.exitCode = 2;
}

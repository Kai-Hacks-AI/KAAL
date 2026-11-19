// Blocks the event loop for good, after writing its own process id where the test can find it.
import { writeFileSync } from 'node:fs';
import { it } from 'node:test';
it('records its pid, then blocks', () => {
  writeFileSync(process.env.KAAL_TERMINATION_PID_FILE, String(process.pid));
  for (;;) { /* never yields */ }
});

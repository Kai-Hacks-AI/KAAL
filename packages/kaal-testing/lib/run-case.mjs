// The entry of every run child (testing/F174): imports the Case file, which registers its own node:test tests as it loads,
// and registers the file's `run()` as one more test when it exports a callable `run`. The Case file is named by KAAL_TESTING_CASE.
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

const file = process.env.KAAL_TESTING_CASE;
const loaded = await import(pathToFileURL(file).href);
if (typeof loaded.run === 'function') test(typeof loaded.id === 'string' ? loaded.id : file, async () => { await loaded.run(); });

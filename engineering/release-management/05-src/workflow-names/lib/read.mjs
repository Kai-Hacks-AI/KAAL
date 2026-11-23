// The only reader of the workflow names: the folder it is given, nothing else.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The top-level `name:` of one workflow: its text, or undefined when there is none. A value that is not plain text (empty, a block scalar) is not parsable and throws.
export function nameOf(text) {
  const line = text.split('\n').find((l) => /^["']?name["']?\s*:/.test(l));
  if (line === undefined) return undefined;
  const value = line.replace(/^["']?name["']?\s*:\s*/, '').replace(/\s+#.*$/, '').trim();
  if (value === '' || /^[|>]/.test(value)) throw new Error(`the top-level name of a workflow is not plain text: ${line.trim()}`);
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return quoted ? quoted[1] : value;
}

export function readWorkflows(head) {
  const dir = join(head, '.github', 'workflows');
  return readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort()
    .map((f) => ({ file: `.github/workflows/${f}`, name: nameOf(readFileSync(join(dir, f), 'utf8')) }));
}

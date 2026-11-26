// recognize Adapter integration: reads the delivered entry of a control and says whether it is built to run through the adapter.
// Structure only: a recognition is no claim that the entry ran, that the call is reached or that its result is used. It never says
// that an entry is not adapted: what it does not recognize is unknown, and the check throws. Pure: it reads no file and calls no service.
import { posix } from 'node:path';

const text = (v) => typeof v === 'string' && v.length > 0;

// One pass over the text: comments are dropped, and every string or template literal is replaced by a numbered mask so that nothing
// inside a literal can be read as code. The text of the literals is kept to read an import specifier.
function mask(source) {
  const strings = [];
  let out = '';
  for (let i = 0; i < source.length;) {
    const c = source[i];
    const next = source[i + 1];
    if (c === '/' && next === '/') { while (i < source.length && source[i] !== '\n') i += 1; continue; }
    if (c === '/' && next === '*') { const end = source.indexOf('*/', i + 2); i = end === -1 ? source.length : end + 2; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < source.length && source[j] !== c) j += source[j] === '\\' ? 2 : 1;
      strings.push(source.slice(i + 1, j));
      out += `"#${strings.length - 1}"`;
      i = j + 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return { code: out, strings };
}

// A block or a statement that a constant condition keeps from running is removed before a call is looked for.
function withoutDeadBranches(code) {
  const dead = /\bif\s*\(\s*(?:false|0|null|undefined)\s*\)\s*/g;
  let result = '';
  let last = 0;
  let m;
  while ((m = dead.exec(code))) {
    let end = m.index + m[0].length;
    if (code[end] === '{') {
      let depth = 0;
      for (; end < code.length; end += 1) {
        if (code[end] === '{') depth += 1;
        else if (code[end] === '}' && (depth -= 1) === 0) { end += 1; break; }
      }
    } else {
      const semi = code.indexOf(';', end);
      end = semi === -1 ? code.length : semi + 1;
    }
    result += code.slice(last, m.index);
    last = end;
    dead.lastIndex = end;
  }
  return result + code.slice(last);
}

// Binding identity is not decided by reading names: no parser is part of the package. The syntax that is supported is narrow, and everything
// outside it is refused as unknown. Every occurrence of the imported name in the entry (the import itself is removed first) must be a call
// of it, `name(...)`, in an expression position. Any other occurrence is a possible declaration of the same name, for a parameter, a
// destructured parameter or variable, a function, a class, a catch parameter or another import, so one such occurrence refuses the entry.
// A call that is followed by a block is a method definition and refuses it too. The refusal is deliberate: a doubtful entry is unknown.
const tokenize = (code) => code.match(/[A-Za-z_$][\w$]*|\d[\w.]*|=>|\.\.\.|[^\s\w$]/g) || [];
const CALL_AFTER = new Set(['await', 'return', '=', '=>', '(', ',', ';', '{', '}', '?', ':', '!', '&', '|', 'yield', 'void']);

function callsOnly(code, name) {
  const t = tokenize(code);
  let calls = 0;
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] !== name || t[i - 1] === '.') continue;
    if (t[i + 1] !== '(' || (i > 0 && !CALL_AFTER.has(t[i - 1]))) return false;
    let depth = 0;
    let close = i + 1;
    for (; close < t.length; close += 1) {
      if (t[close] === '(') depth += 1;
      else if (t[close] === ')' && (depth -= 1) === 0) break;
    }
    if (close >= t.length || t[close + 1] === '{') return false;
    calls += 1;
  }
  return calls > 0;
}

export function recognizeIntegration({ control, entry, adapter, revision } = {}) {
  if (!text(control) || !text(adapter) || !text(revision)) throw new Error('recognizeIntegration: control, adapter and revision must be non-empty strings');
  if (!entry || !text(entry.path) || !text(entry.text)) throw new Error('recognizeIntegration: the entry must have a path and text');
  const { code, strings } = mask(entry.text);
  const target = posix.normalize(adapter);
  const binding = [];
  const imports = /(?:^|[;}\n])\s*import\s*\{([^}]*)\}\s*from\s*"#(\d+)"/g;
  let m;
  while ((m = imports.exec(code))) {
    const spec = strings[Number(m[2])];
    if (!spec.startsWith('.') || posix.join(posix.dirname(entry.path), spec) !== target) continue;
    for (const part of m[1].split(',').map((p) => p.trim())) {
      const named = /^runControl(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(part);
      if (named) binding.push(named[1] || 'runControl');
    }
  }
  // only the import of the adapter is removed; any other import that binds the name stays and refuses the entry
  const isAdapter = (spec) => spec.startsWith('.') && posix.join(posix.dirname(entry.path), spec) === target;
  const live = withoutDeadBranches(code.replace(imports, (all, list, index) => (isAdapter(strings[Number(index)]) ? ' ' : all)));
  for (const name of binding) {
    if (callsOnly(live, name)) return { control, revision, integration: 'recognized' };
  }
  throw new Error(`recognizeIntegration: the entry of ${control} does not show an integration with the adapter`);
}

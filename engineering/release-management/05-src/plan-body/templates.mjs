// A40 template-reader: sorts the pull request templates of the base into declared KAAL templates,
import { stripComments } from './comments.mjs';
// the DEFAULT TYPE and other templates, and derives the registry of types and their chapters.
const DECLARATION = /<!--\s*KAAL-PR-template:\s*([^>]*?)\s*-->/g;
const TYPE = /^[A-Z][A-Z0-9_]*$/;
const DEFAULT_PATH = /^(?:docs\/|\.github\/)?pull_request_template(?:\.[a-z0-9]+)?$/i;
const DIRECTORY_PATH = /^(?:docs\/|\.github\/)?pull_request_template\/[^/]+$/i;
const QUESTION = 'I found templates that are not KAAL templates; what should we do with them?';

const headings = (text) => stripComments(text).split('\n').filter((line) => /^##\s+\S/.test(line)).map((line) => line.replace(/^##\s+/, '').replace(/\s*#*\s*$/, ''));

export function readTemplates(files) {
  const registry = {};
  const findings = [];
  const others = [];
  const facts = {};
  const typed = new Map();
  const declaredDefaults = [];
  const defaults = [];
  for (const { path, text } of files) {
    const isDefault = DEFAULT_PATH.test(path);
    if (!isDefault && !DIRECTORY_PATH.test(path)) continue;
    if (isDefault) defaults.push(path);
    const declarations = [...text.matchAll(DECLARATION)].map((match) => match[1]);
    const chapters = headings(text);
    if (declarations.length === 0) {
      others.push(path);
      facts[path] = { headings: chapters, declarationLike: /<!--\s*[\w-]+:[^>]*-->/.test(text) };
      continue;
    }
    if (declarations.length > 1) { findings.push(`${path} holds ${declarations.length} KAAL-PR-template declarations; it must hold one`); continue; }
    const [declared] = declarations;
    if (!TYPE.test(declared)) { findings.push(`${path} declares KAAL-PR-template "${declared}"; a TYPE is an upper-case word`); continue; }
    if (declared === 'DEFAULT') {
      if (isDefault) {
        if (/^<!--\s*KAAL-PR-template:\s*DEFAULT\s*-->\s*$/.test(text.split('\n')[0])) declaredDefaults.push({ path, chapters });
        else findings.push(`${path} declares DEFAULT but not on its first line; the declaration must open the default file`);
      } else findings.push(`${path} declares DEFAULT but is not at a default template path`);
      continue;
    }
    if (isDefault) { findings.push(`${path} is at a default template path and declares the TYPE ${declared}; only DEFAULT may be declared there`); continue; }
    if (chapters[0] !== 'Change') { findings.push(`${path} declares ${declared} but its first chapter is not Change`); continue; }
    typed.set(declared, [...(typed.get(declared) ?? []), { path, chapters }]);
  }
  for (const [type, templates] of typed) {
    if (templates.length > 1) findings.push(`the TYPE ${type} is declared twice (${templates.map((t) => t.path).join(', ')}); it is duplicate and ambiguous and is not in the registry`);
    else registry[type] = templates[0].chapters;
  }
  if (defaults.length > 1) findings.push(`several default template files exist (${defaults.join(', ')}); DEFAULT is ambiguous and is not in the registry`);
  else if (declaredDefaults.length === 1) {
    const [{ path, chapters }] = declaredDefaults;
    if (chapters[0] === 'Change') registry.DEFAULT = chapters;
    else findings.push(`${path} declares DEFAULT but its first chapter is not Change`);
  }
  const decisions = others.length === 0 ? [] : [{ kind: 'non-KAAL-templates', paths: others, facts, question: QUESTION }];
  return { registry, findings, decisions };
}

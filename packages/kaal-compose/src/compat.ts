// What an Agent Skill declares it needs beside it: the `compatibility` of its
// SKILL.md frontmatter (the Agent Skills standard's free text). The reading is
// the installer's own, held to the same bounded shape: a representation that
// cannot be decoded reliably is `unreadable`, never "no declaration", and the
// install is then refused as an unmet need is.

/** The `compatibility` an Agent Skill declares, as the string value it decodes to. */
export function compatibility(skill: string): { value: string } | { unreadable: string } {
  const lines = skill.replace(/\r\n/g, "\n").split("\n");
  if (skill === "") return { value: "" };
  // The frontmatter starts the file, is closed by a line of `---`, and holds only blank lines, comment lines, plain `key:` lines at column 0 and space-indented lines that continue the key above.
  const shape = "a frontmatter outside the supported shape (plain `key:` lines at column 0, space-indented continuation lines, comment lines)";
  const close = lines.indexOf("---", 1);
  if (lines[0] !== "---" || close < 0) return { unreadable: shape };
  const front = lines.slice(1, close);
  let keyed = false;
  for (const l of front) {
    if (l.trim() === "" || l.startsWith("#")) continue;
    if (/^[A-Za-z][A-Za-z0-9_-]*:(\s|$)/.test(l)) keyed = true;
    else if (!(keyed && /^ +\S/.test(l))) return { unreadable: shape };
  }
  const keys = front.filter((l) => l.startsWith("compatibility:"));
  if (keys.length > 1) return { unreadable: "a frontmatter that repeats the key `compatibility`" };
  const at = front.findIndex((l) => l.startsWith("compatibility:"));
  if (at < 0) return { value: "" };
  let first = front[at].slice("compatibility:".length).trim();
  let rest: string[] = [];
  for (const l of front.slice(at + 1)) {
    if (l.trim() !== "" && !/^\s/.test(l)) break;
    rest.push(l);
  }
  const comment = /(^|\s)#/;
  // The value may start on a following line, below an empty or comment-only key line.
  if (first === "" || first.startsWith("#")) {
    const i = rest.findIndex((l) => l.trim() !== "" && !l.trim().startsWith("#"));
    if (i < 0) return { value: "" };
    first = rest[i].trim();
    rest = rest.slice(i + 1);
  }
  if (/^[>|]/.test(first)) return { value: rest.map((l) => l.trim()).join("\n") };
  if (first.startsWith('"') || first.startsWith("'")) {
    const quote = first[0];
    const body = [first.slice(1), ...rest.map((l) => l.trim())].join("\n");
    if (quote === '"' && body.includes("\\")) return { unreadable: "a double-quoted scalar with an escape sequence" };
    let out = "";
    for (let i = 0; i < body.length; i++) {
      if (body[i] === quote) {
        if (quote === "'" && body[i + 1] === "'") {
          out += "'";
          i++;
          continue;
        }
        const after = body.slice(i + 1);
        return /^\s*(#.*)?$/.test(after.split("\n")[0]) && after.split("\n").slice(1).every((l) => l.trim() === "" || l.trim().startsWith("#")) ? { value: out } : { unreadable: "text after the closing quote" };
      }
      out += body[i];
    }
    return { unreadable: "a quoted scalar that does not close" };
  }
  if (/^[&*!\[{%@`]/.test(first)) return { unreadable: `a value starting with ${first[0]} (an anchor, alias, tag or flow collection)` };
  return plain([first, ...rest], comment);
}

/** A plain (multi-line) scalar: its lines folded by a space, ended by the first comment. */
function plain(lines: string[], comment: RegExp): { value: string } {
  const out: string[] = [];
  for (const raw of lines) {
    const l = raw.trim();
    const c = comment.exec(l);
    if (c) {
      const cut = l.slice(0, c.index).trim();
      if (cut) out.push(cut);
      break;
    }
    if (l) out.push(l);
  }
  return { value: out.join(" ") };
}

/** The capability-name prefix of an Engine: its instance's `capability-prefix`, in the text of `core/config`, else `kaal-`. */
export function prefix(config: string): string {
  return /^capability-prefix\s*=\s*(\S+)\s*$/m.exec(config)?.[1] ?? "kaal-";
}

/** The capability names a declaration mentions: whole words that begin with the prefix. Core's own package is not a capability. */
export function named(text: string, pre: string): string[] {
  const esc = pre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = text.match(new RegExp(`(?<![\\w-])${esc}[a-z0-9]+(?:-[a-z0-9]+)*`, "g")) ?? [];
  return [...new Set(found)].filter((n) => n !== "kaal-core");
}

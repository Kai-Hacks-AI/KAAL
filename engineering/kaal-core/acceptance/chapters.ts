// Splits Markdown into chapters at its ATX headings (`#` to `######`),
// ignoring headings inside fenced code. It restates nothing about the Kernel:
// the chapters of the sealed Kernel are whatever its own headings are, and
// they are the seams from which outer-loop suites are organized.

export interface Chapter {
  /** Heading level, 1 to 6; 0 for text before the first heading. */
  level: number;
  /** Heading text; empty for text before the first heading. */
  title: string;
  /** The chapter verbatim, heading line included, up to the next heading. */
  markdown: string;
}

export function chapters(markdown: string): Chapter[] {
  const out: Chapter[] = [];
  let fenced = false;
  for (const line of markdown.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced;
    const heading = fenced ? null : /^(#{1,6}) +(\S.*?)\s*$/.exec(line);
    if (heading) out.push({ level: heading[1].length, title: heading[2], markdown: line });
    else if (out.length === 0) out.push({ level: 0, title: "", markdown: line });
    else out[out.length - 1].markdown += line;
  }
  return out;
}

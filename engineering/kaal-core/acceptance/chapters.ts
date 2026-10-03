// Exposes the chapters of a deployed Node: the Markdown between its headings
// (`#` to `######` at the start of a line). This is a seam for outer-loop
// suites, not a Markdown implementation: it is only asked about the sealed
// Kernel, whose bytes are fixed, and it knows nothing else about Markdown.

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
  for (const line of markdown.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const heading = /^(#{1,6}) +(\S.*?)\s*$/.exec(line);
    if (heading) out.push({ level: heading[1].length, title: heading[2], markdown: line });
    else if (out.length === 0) out.push({ level: 0, title: "", markdown: line });
    else out[out.length - 1].markdown += line;
  }
  return out;
}

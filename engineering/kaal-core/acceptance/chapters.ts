// Splits Markdown into chapters at its ATX headings (`#` to `######`, indented
// at most three spaces), ignoring headings inside fenced code (CommonMark
// fences: three or more backticks or tildes, indented at most three spaces,
// closed by the same character at least as long). It restates nothing about the Kernel:
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
  let fence: string | null = null;
  for (const line of markdown.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const marks = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line.trimEnd());
    if (fence === null) {
      if (marks && !(marks[1][0] === "`" && marks[2].includes("`"))) fence = marks[1];
    } else if (marks && marks[1][0] === fence[0] && marks[1].length >= fence.length && marks[2].trim() === "") {
      fence = null;
    }
    const heading = fence === null && !marks ? /^ {0,3}(#{1,6}) +(\S.*?)\s*$/.exec(line) : null;
    if (heading) out.push({ level: heading[1].length, title: heading[2], markdown: line });
    else if (out.length === 0) out.push({ level: 0, title: "", markdown: line });
    else out[out.length - 1].markdown += line;
  }
  return out;
}

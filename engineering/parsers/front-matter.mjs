// The one reader of YAML front matter in Engineering: a leading `---` ... `---` block, in a Markdown file or (once the comment
// delimiters are removed) in a block comment. The `yaml` package's own parser finds where the first document ends; nothing here
// matches the text with a pattern. The body after the block is never parsed.
import { CST, Parser, parseDocument } from "yaml";

/** `{ value, errors }` for the front matter at the start of source, or null when source does not start with a `---` block. */
export function frontMatter(source) {
  if (!source.startsWith("---")) return null;
  for (const token of new Parser().parse(source)) {
    if (token.type !== "document") continue;
    const document = parseDocument(CST.stringify(token));
    return { value: document.toJS(), errors: document.errors.map((e) => `${e.code} at line ${e.linePos?.[0].line ?? "?"}`) };
  }
  return null;
}

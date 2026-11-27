# hosting/C115 change

## From

The declaration format renders everything a type says as a comment. A type that needs one line the reader can see (the HOTFIX envelope line) cannot declare it, so the line either stays hand written outside the declaration or is lost when the template is generated.

## To

1. **One optional field, `visible`.** A declaration may hold `visible`: a string of text meant to be seen by the author and the reviewer, not hidden. It is KAAL data like the rest: plain text with the usual inline emphasis, no GitHub word, no file name, no comment syntax. It is the same kind of field as `intro`, rendered the other way.
2. **Where it renders.** `renderTemplate` writes it after the declaration line and the `intro` comment and before the first chapter, as plain lines (not in a comment). `renderBody` writes it as the first lines of the body, before the first chapter, so what the template shows and what a raised body shows agree. A declaration without `visible` renders exactly as before, byte for byte (the C113 Cases T303 to T317 stay GREEN unchanged).
3. **What the validator refuses.** `visible` that is not a non-empty string, that holds `<!--` or `-->` (it would open or close the comment form it is meant to escape), or that has a line starting with `#` (it would add a chapter the declaration does not name). `INVALID_DECLARATION`, naming the field. CRLF comes out as LF, as everywhere else.
4. **One renderer, still checked.** `checkTemplates` compares the committed template with the render, so a template that drops or edits the visible text is `differs`.
5. **Not a chapter.** The text is not a chapter, has no guidance and is not asked of the author: `renderBody` takes no input for it, and the raise path adds it itself from the owner's declaration at the base revision. Caller-supplied `visible` is refused like any other caller-supplied authority.

The form is agreed with kaal-change (the first user, C14 question 2): HOTFIX declares `visible` with its envelope line unchanged, and no other type needs it yet.

## Because

kaal-change and release/C138 can hand the whole of every type to Hosting without losing the one line a reader sees today, and the templates are generated from the declaration alone, not part generated and part hand written.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T317 stay GREEN. Nothing existing changes; a declaration without `visible` renders as before.
2. Accept list: none.
3. Feature Cases, RED on `main` today. Executable drafts in this folder (`visible.red.mjs`); the DO turns them into delivered Cases unchanged.
   - hosting/T332: `renderTemplate` with `visible` gives exact bytes: declaration line, `intro` comment, the visible text as plain lines, then the chapters; and `renderBody` begins with the same visible text and then the chapters. A declaration without `visible` is byte-for-byte what C113 gave.
   - hosting/T333: the validator refuses `visible` that is empty, not a string, holds `<!--` or `-->`, or has a line starting with `#`, with `INVALID_DECLARATION` naming `visible`; CRLF comes out as LF.
   - hosting/T334: `checkTemplates` names a template without the visible text, or with it changed, as `differs`.
   - hosting/T335: `raisePullRequest` puts the owner's `visible` first in the body it opens, read from the declaration at the base revision (a different text on the head is never read); a request or option that carries `visible` is `RAISE_REFUSED` (rule `caller-authority`) before any call, not even a read; a declaration without `visible` raises the C113 body byte for byte. Executable in `visible.red.mjs`, against the C113 raise fixtures (the DO moves it beside them).

## Not in this Change

Any DO. Kaal-change's declaration (C14) and its DO, release's C138, any template install (a WIRE, Kai's go), a second visible field, markup beyond plain text.

## DO

Not authorized by this PLAN. On the merged PLAN: the field and its validator, the two renderers, the raise path, T332 to T335 as delivered Cases, the ids in `04-test/package-check/testing.md`, the element texts, the README. Then kaal-change's C14 DO and release's C138 DO can declare the line.

## ACT

The 4L retrospective after the DO.

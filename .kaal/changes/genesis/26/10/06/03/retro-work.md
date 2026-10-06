# Retro

## Learned

That I let a parsing convenience pass as a rule about content. I banned heading lines from a retrospective's texts because my parser used headings as delimiters, and the Owner pointed out that this made a serialization constraint look like retrospective semantics. The honest fix was to keep the form and change the representation: a heading-like line is written with a backslash in front and read back as given, so nothing the writer says is restricted. I also learned how little a form needs from its content: only that it is non-empty.

## Liked

That the repository's own retrospectives still passed the checker after the representation changed, and that making check accept only what write would produce kept the change honest: a reading that is not an exact inverse of the writing is rejected, not guessed at.

## Lacked

A way to settle a design choice like this one before building it. I wrote the ban into the Work as a requirement, and it took a review to see that it was not one; a short note in the Work on which constraints are the form's and which are only the parser's would have caught it earlier.

## Longed

For the Observer to read the form as the one place a retrospective's structure is decided, and for Changing KAAL to consume it, so that nobody has to describe or hand-write the four parts again.

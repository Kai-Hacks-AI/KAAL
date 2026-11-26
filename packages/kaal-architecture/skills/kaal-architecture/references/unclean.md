# When a statement does not sort cleanly

- **Mixed.** If one statement holds both concerns, split it into one statement for each. Do not file the whole under its dominant part.
- **Constraint across the line.** A constraint belongs to the concern it actually constrains, even when it affects the other. A Delivery constraint that limits what the solution can offer stays Delivery, and a Solution constraint that restricts the choice of means stays Solution. Note the effect on the other concern. If the limitation is independently accepted as a requirement of the solution, state it explicitly as its own Solution statement. If the statement does not say whether it is accepted, ask.
- **Ambiguous.** If a term can mean either concern, or the context and authority needed to decide are missing, such as "reliable", "mandatory" or "supported", name the two readings and put the question to the author. Do not guess, and do not pick the reading that is easier to classify.

Raise each of these before design proceeds, and say what you would need to know to settle it.

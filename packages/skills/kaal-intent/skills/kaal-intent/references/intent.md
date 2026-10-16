# Reference: an Intent

```
---
name: <what is wanted, in a few words>
---

# <the same name>

<What is wanted, in the terms of whoever wants it, complete enough to be understood alone.>

## Why

<Why it is wanted.>
```

The frontmatter holds `name` and nothing else. Use UTF-8 and LF line endings. The file is then in the Kernel's Form without a type, so `kaal identify <file>` gives its id: the SHA-256 of its exact bytes.

## Example

```
---
name: Intent capture
---

# Intent capture

KAAL keeps what people and Agents want to achieve, whatever the source, without losing its meaning and without confusing it with requirements, Changes or conversation.

## Why

Intentions are raised in conversations, reviews and observations, and are lost when those end or are mixed up with the work that follows.
```

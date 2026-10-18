# Reference: an Intent

```
---
name: <what is wanted, in a few words>
type:
  name: Intent
  id: 5242eba5542a63b6fa193ac42ccf68d791e98d922880c7660cbdf4c054a114bc
---

# <the same name>

<What is wanted, in the terms of whoever wants it, complete enough to be understood alone.>

## Why

<Why it is wanted.>
```

The frontmatter holds `name` and `type`, and nothing else. The `type` references the `Intent` Definition Node that `kaal-intent` delivers, by its name and exact id. Use UTF-8 and LF line endings. The file is then a Node in Form, so `kaal identify <file>` gives its id: the SHA-256 of its exact bytes.

## Example

```
---
name: Intent capture
type:
  name: Intent
  id: 5242eba5542a63b6fa193ac42ccf68d791e98d922880c7660cbdf4c054a114bc
---

# Intent capture

KAAL keeps what people and Agents want to achieve, whatever the source, without losing its meaning and without confusing it with requirements, Changes or conversation.

## Why

Intentions are raised in conversations, reviews and observations, and are lost when those end or are mixed up with the work that follows.
```

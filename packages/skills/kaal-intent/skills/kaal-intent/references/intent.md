# Reference: an Intent

```
---
name: <what is wanted, in a few words>
type:
  name: Intent
  id: f86d4e30bf200b59da174c7fee0b73e61b2d87e209e34c1ce7938929d3b260ae
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
  id: f86d4e30bf200b59da174c7fee0b73e61b2d87e209e34c1ce7938929d3b260ae
---

# Intent capture

KAAL keeps what people and Agents want to achieve, whatever the source, without losing its meaning and without confusing it with requirements, Changes or conversation.

## Why

Intentions are raised in conversations, reviews and observations, and are lost when those end or are mixed up with the work that follows.
```

## An Intent element of a capability

A capability's PLAN states its Intents as elements, such as `graph/I7`. When one becomes a Node, it takes the same form, named by its identity. The name matches `^[a-z][a-z0-9-]*/I[1-9][0-9]*$`: the owning capability's short name, then `I` and a positive integer it assigns and never reuses. The Node lives in the owning capability's location. It carries no Edges. A Requirement that serves it points at it, by name and exact id, so an edit to the Intent leaves those Edges pinned to the earlier version until the same Change re-pins them.

```
---
name: graph/I7
type:
  name: Intent
  id: f86d4e30bf200b59da174c7fee0b73e61b2d87e209e34c1ce7938929d3b260ae
---

# graph/I7

reach, cycles and reverse compose: what one returns, another reads with every edge kept.

## Why

A caller derives predecessors with reverse and walks them with reach, and an edge silently dropped between the two gives a wrong answer with no error.
```

# Hosting: non-functional requirements

Hosting states each non-functional requirement (`hosting/N1` to `hosting/N11`) beside the functional requirements it constrains, in [`../functional/requirements.md`](../functional/requirements.md), so a reader finds the obligation and its limit in one place and the allocation to Cases in `04-test/package-check/testing.md` names both by id.

This folder exists because the package layout requires it; it holds this pointer and no requirement of its own. Moving the `hosting/N` statements here would change every Case and document that quotes their position, and is a separate Change if the Owner wants it.

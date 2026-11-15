# C32 interface

## Draft of the manifest

```
{
  "package": "kaal-release",
  "version": "0.0.1",
  "changes": [
    { "id": "release/C27", "capability": "release", "role": "required" },
    { "id": "release/C26", "capability": "release", "role": "optional" }
  ]
}
```

The entries are an example of the shape only. Which Changes are `required` for kaal-release 0.0.1 is decided in a later DO.

## Draft of the report

```
{ "ready": false, "delivered": ["release/C27"], "missing": ["release/C26"] }
```

`ready` is true only when no `required` Change is missing. A missing `optional` Change is reported and does not block.

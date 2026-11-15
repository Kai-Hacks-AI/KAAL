# C32 interface

## Draft of the manifest

```
{
  "package": "kaal-release",
  "version": "0.0.1",
  "contract": {
    "intents": [
      { "id": "release/I9", "status": "retained" },
      { "id": "release/I25", "status": "new" }
    ]
  },
  "delivery": {
    "changes": [
      { "id": "release/C27", "capability": "release" },
      { "id": "release/C26", "capability": "release" }
    ]
  }
}
```

The entries are an example of the shape only. Which Intents form the contract and which Changes are committed is decided in a later DO. Every listed Change is committed; candidates are kept outside the manifest.

## Draft of the report

```
{
  "deliveryScope": { "complete": false, "delivered": ["release/C27"], "missing": ["release/C26"] },
  "contract": { "unserved": "UNKNOWN" },
  "productVerification": "UNKNOWN",
  "publicationReadiness": "UNKNOWN"
}
```

`complete` is true only when every declared Change is delivered on `main`. `contract.unserved` lists the `new` Intents no Change of the delivery scope serves, and is UNKNOWN when the traceability function is not supplied. There is no `ready` field.

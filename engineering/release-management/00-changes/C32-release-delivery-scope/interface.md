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
      { "id": "release/C27", "capability": "release", "role": "required" },
      { "id": "release/C26", "capability": "release", "role": "optional" }
    ]
  }
}
```

The entries are an example of the shape only. Which Intents form the contract and which Changes are `required` is decided in a later DO.

## Draft of the report

```
{
  "deliveryScope": { "complete": false, "delivered": ["release/C27"], "missing": ["release/C26"] },
  "contract": { "unserved": "UNKNOWN" },
  "productVerification": "UNKNOWN",
  "publicationReadiness": "UNKNOWN"
}
```

`complete` is true only when no `required` Change is missing; a missing `optional` Change is reported and does not block. `contract.unserved` lists the `new` Intents no Change of the delivery scope serves, and is UNKNOWN when the traceability function is not supplied. There is no `ready` field.

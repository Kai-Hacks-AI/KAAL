# Intent

Enable KAAL to collect KAAL-addressed communication from KAAL clients it can reach.

KAAL clients may carry communication intended for KAAL, such as KAAL Incidents and KAAL Requests. Collection is the KAAL-side capability that finds and brings those carriers into KAAL when an available connection to the client permits it.

Do not assume that KAAL can see every client.

A client may be known but unreachable, reachable through one environment but not another, or discoverable through an adapter available to the collecting agent. The collection model must preserve that distinction rather than treating the visible set of clients as the complete population of KAAL installations.

Transport and host access are adapter concerns. GitHub may provide one way to reach a client repository; another host or environment may provide another. Collection should use available adapters rather than make a particular transport part of the meaning of a KAAL client or its communication carriers.

A client remains in control of what it exposes to KAAL. Collection concerns KAAL-addressed carriers available through the client's embedded KAAL boundary; it must not imply permission to inspect arbitrary client content.

Preserve the identity of the originating client and each collected carrier.

Do not turn collected communication directly into GitHub Issues, Changes, backlog entries or decisions. Collection brings evidence to KAAL; interpretation, prioritization and action remain separate concerns.

Do not encode Enercon or GitHub as the universal client or transport model.

The result should support the relationship:

`KAAL client → available adapter → exposed KAAL carriers → collection by KAAL`

while remaining truthful about partial visibility:

`known clients ≠ reachable clients ≠ all KAAL clients`

Let the Work determine the smallest useful mechanism for knowing, discovering or reaching clients without collapsing those concepts into one registry.

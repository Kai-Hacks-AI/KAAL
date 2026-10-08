# Retro

## Learned

I learned that address-free identities do not make preservation independent of location by themselves. A correct comparison also needs a trustworthy baseline assembled from the target revision. Reviewing the controls alongside the proposed architecture exposed a case in which an intact identity could be absent from the comparison altogether. Reading the Worker’s and Owner’s retrospectives clarified how the original directory move had helped uncover the more useful Engine, Record and Subject distinction.

## Liked

I liked that the Worker resolved the finding in the Requirements and Architecture rather than merely changing the wording of the claim. The intact and omitted-history cases made the correction concrete, and my independent check retained all 24 closed identities in the intact Record while identifying precisely the omitted Change. I also liked the explicit separation between a converged architectural investigation and production implementation, which kept review within this Change’s scope.

## Lacked

I initially lacked the discipline of entering the repository’s review protocol before publishing my finding. I posted a conversation comment without the required identity-bound round and corrected that only after Kai prompted me. The architectural evidence also lacked a complete lifecycle outside .kaal and product controls implementing the proposed resolution; I could assess the direction and the existing preservation predicate, but could not verify those future behaviors.

## Longed

I longed for later implementation Changes to carry repeatable evidence that independently resolved baseline and candidate Records preserve history across all three modes, including refusal when a candidate locator hides a closed Change. I would also like future reviews to begin with the protocol and exact Work identity so their judgment and handoff are recorded correctly from the first round.

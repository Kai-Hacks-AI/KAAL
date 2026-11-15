# Delivery admission (Engineering)

Engineering's IN control for `main`: one required context, **Delivery Admission**, that judges a pull request into `main` by the class of its head ref and fails closed on anything it cannot classify or evidence. Today's Promotion Source admits only `kaal/*` heads (`engineering/github/lineage.ts`, `promotionSource`), so `hotfix/<name>` and `wire/<name>` cannot enter `main`.

PLAN stage: nothing here is built or installed. Changes: `00-changes/C16-delivery-admission/` (engineering/C16, Cases T450 to T459).

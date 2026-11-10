# Intent

- **release-management/I1. A package reaches its consumers only through stations, and each station owns the move into it.** The flow is pull-oriented: a station is a stock, and what enters a stock is decided and evidenced at that station's border, not by the one before it.
- **release-management/I2. What a consumer installs from npm is exactly what `main` promoted and Engineering tested, and anyone can tell.** The three controls of the `npmjs` station make that checkable: a version is named once and in order, a publication is approved by a person, and the published bytes are compared with the promoted ones afterwards.
- **release-management/I3. Engineering owns this until a better owner is found** (Owner, 9 Nov 2026: engineer KAAL to be able to embed KAAL). When Packaging is installed it takes over what is package acceptance; the mechanics stay reusable.
- **release-management/I4. Delivery architecture changes independently of Solution architecture** (Owner, 9 Nov 2026). Delivery elements (release controls, workflow wiring, the test machinery) change in their own Changes and judge candidates as `main`'s copy; Solution changes (product code and the Cases that test it) travel in candidates. `.github travels alone` and the hard pin to `main` are instances of this rule, and `release-management` is itself a Delivery element.
- **release-management/I5. A version is named once, in order, and tied to the commit that carries it** (control version Package, under I2; applied at `main`).
- **release-management/I6. A person approves each publication** (control approve Publishing, under I2; applied at `npmjs`).
- **release-management/I7. Anyone can tell that the published bytes are the promoted bytes** (control verify Package, under I2; applied at `npmjs`).

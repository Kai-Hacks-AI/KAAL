# Registering Hosting with Core

With Core installed in the project:

```
kaal init
kaal register capability core <dir>
```

where `<dir>` is the directory of the installed `@kaihacksai/kaal-hosting` package. Core then finds `dist/kaal/Hosting.md`, Hosting's Extension Node, through the package's `contribution()`.

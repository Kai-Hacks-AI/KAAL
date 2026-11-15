# Hosting with KAAL Core

If KAAL Core is installed, Core reads Hosting's Extension Node (`Hosting.md`, key `Hosting.md`) from this package and registers Hosting as the capability that crosses the host boundary. If Core is not installed, Hosting works on its own as a library and a command; nothing here is a dependency in `package.json`.

What Core uses from Hosting: [register.md](register.md).

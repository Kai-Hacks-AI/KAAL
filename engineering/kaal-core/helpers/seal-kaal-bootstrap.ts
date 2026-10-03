// seal-kaal-bootstrap: the bootstrap policy applied with the sealing mechanism.
// Run twice by its npm script, because Node 2 carries Node 1's ID.
import { sealBootstrap } from "./bootstrap.js";

sealBootstrap();
